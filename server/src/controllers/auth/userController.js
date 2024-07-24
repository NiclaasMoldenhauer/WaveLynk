import asyncHandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Token from '../../models/auth/Token.js';
import crypto from 'node:crypto';
import hashToken from '../../helpers/hashToken.js';
import sendEmail from '../../helpers/sendEmail.js';

export const registerUser = asyncHandler (async (req, res) => {
  const {name, email, password} = req.body;

  // validation
  if (!name || !email || !password) {
    // 400 Bad Request
    res.status (400).json ({message: 'Fülle alle Felder aus!'});
  }

  // Check Passwort länge
  if (password.length < 8) {
    return res
      .status (400)
      .json ({message: 'Passwort muss min. 8 Zeichen haben!'});
  }

  // Check ob User existiert
  const userExists = await User.findOne ({email});

  if (userExists) {
    // Bad Request
    return res.status (400).json ({message: 'Account existiert bereits!'});
  }

  // create new user
  const user = await User.create ({
    name,
    email,
    password,
  });

  // generate token with ID
  const token = generateToken (user._id);

  // send back user and token to client
  res.cookie ('token', token, {
    path: '/',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
    sameSite: true,
    secure: true,
  });

  if (user) {
    const {_id, name, email, role, photo, bio, isVerified} = user;

    // 201 Created
    res.status (201).json ({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status (400);
    throw new Error ('Fehler beim Erstellen des Users!');
  }
});

// User Login

export const loginUser = asyncHandler (async (req, res) => {
  // Get Email/Password from req.body
  const {email, password} = req.body;

  // Validation
  if (!email || !password) {
    return res
      .status (400)
      .json ({message: 'Füge deine Email und Passwort hinzu'});
  }

  // check if user exists
  const userExists = await User.findOne ({email});
  if (!userExists) {
    return res.status (404).json ({message: 'Dieser Account existiert nicht!'});
  }
  // Check ob Passwort übereinstimmt mit der Datenbank
  const isMatch = await bcrypt.compare (password, userExists.password);

  if (!isMatch) {
    return res.status (401).json ({message: 'Falsches Passwort!'});
  }

  // generate token with ID
  const token = generateToken (userExists._id);

  if (userExists && isMatch) {
    const {_id, name, email, role, photo, bio, isVerified} = userExists;

    // set the token in the cookie
    res.cookie ('token', token, {
      path: '/',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Tage
      sameSite: true,
      secure: true,
    });

    // send back user and token to client
    res.status (200).json ({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status (400).json ({message: 'Fehler beim Einloggen!'});
  }
});

// logout user

export const logoutUser = asyncHandler (async (req, res) => {
  res.clearCookie ('token');
  res.status (200).json ({message: 'Dein Account wurde abgemeldet'});
});

// Get User
export const getUser = asyncHandler (async (req, res) => {
  // get user details from token ---> OHNE PASSWROT!
  const user = await User.findById (req.user._id).select ('-password');

  if (user) {
    res.status (200).json (user);
  } else {
    res.status (404).json ({message: 'User nicht gefunden!'});
  }
});

// update user
export const updateUser = asyncHandler (async (req, res) => {
  // get user details from token ---> Protect middleware
  const user = await User.findById (req.user._id);
  if (user) {
    // user properties update
    const {name, photo, bio} = req.body;
    // update user
    user.name = req.body.name || user.name;
    user.photo = req.body.photo || user.photo;
    user.bio = req.body.bio || user.bio;

    const updated = await user.save ();

    res.status (200).json ({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVerified: updated.isVerified,
    });
  } else {
    res.status (404).json ({message: 'User nicht gefunden!'});
  }
});

// login status

export const userLoginStatus = asyncHandler (async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    // 401 Unauthorized
    return res.status (401).json ({message: 'Du musst angemeldet sein'});
  }

  // token auswerten
  const decoded = jwt.verify (token, process.env.JWT_SECRET);

  if (decoded) {
    res.status (200).json (true);
  } else {
    res.status (401).json (false);
  }
});

// email verification

export const verifyEmail = asyncHandler (async (req, res) => {
  const user = await User.findById (req.user._id);

  // check ob user existiert
  if (!user) {
    res.status (404).json ({message: 'User nicht gefunden'});
  }

  // check ob Email bereits verifiziert wurde
  if (user.isVerified) {
    res.status (400).json ({message: 'Email ist bereits verifiziert'});
  }

  let token = await Token.findOne ({userID: user._id});

  // check ob token existiert ---> token löschen
  if (token) {
    await token.deleteOne ();
  }

  // erstellen eines verifizierungs tokens --> crypto
  const verificationToken = crypto.randomBytes (64).toString ('hex') + user._id;

  // hash des verifizierungs tokens
  const hashedToken = hashToken (verificationToken);


  // Token in der Datenbank speichern
  await new Token ({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now (),
    // 24 Stunden in Millisekunden // 24 Stunden * 60 Minuten * 60 Sekunden * 1000 Millisekunden = 86400000 Millisekunden
    expiresAt: Date.now () + 24 * 60 * 60 * 1000,
  }).save ();

  // verification link
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // send email
  const subject = 'Automatisch: Bitte bestätige deine E-Mail Adresse!';
  const send_to = user.email;
  const reply_to = 'noreply@gmail.com;';
  const template = 'emailVerification';
  const send_from = process.env.USER_EMAIL;
  const name = user.name;
  const url = verificationLink;

  try {
    // Reihenfolge ist wichtig
    await sendEmail (
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      url
    );
    return res.json ({
      message: 'E-Mail wurde versendet. Bitte bestätige deine E-Mail!',
    });
  } catch (error) {
    console.log ('Fehler beim Senden der E-Mail...', error);
    return res
      .status (500)
      .json ({message: 'Email konnte nicht versendet werden'});
  }
});

// User Verifizierung

export const verifyUser = asyncHandler (async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status (400).json ({message: 'Ungültiger Token'});
  }

  // hash des verifizierungs tokens --> hashed vor dem vergleichen
  const hashedToken = hashToken (verificationToken);

  // finde user mit dem verifizierungs token aus der Datenbank
  const userToken = await Token.findOne ({
    verificationToken: hashedToken,
    // check ob der verifizierungs token abgelaufen ist
    expiresAt: {$gt: Date.now ()},
  });

  if (!userToken) {
    return res
      .status (400)
      .json ({message: 'Abgelaufener Token. Bitte Registrierung neu starten!'});
  }

  // user mit ID aus der Datenbank auswerten
  const user = await User.findOne (userToken.userId);
  if (user.isVerified) {
    // 400 Bad Request
    return res.status (400).json ({message: 'Account ist bereits verifiziert'});
  }

  // user mit ID aus der Datenbank aktualisieren
  user.isVerified = true;
  await user.save ();
  res.status (200).json ({message: 'Account wurde erfolgreich verifiziert'});
});


// forgot password
export const forgotPassword = asyncHandler (async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
    .status(400)
    .json({ message: 'Füge deine Email hinzu' });
  }

  // checken ob der user existiert
  const user = await User.findOne({ email });

  if (!user) {
    // 404 Not Found
    return res
      .status(404)
      .json({ message: 'Dieser Account existiert nicht' });
  }

  // checken ob der token existiert
  let token = await Token.findOne({ userId: user._id });

  // falls der token existiert, wird er gelöscht
  if (token) {
    await token.deleteOne();
  }

  // reset token erstellen mit der user ID ---> läuft nach 1 Stunde ab
  const passwordResetToken = crypto.randomBytes(64).toString('hex') + user._id;

  // Reset token hashen
  const hashedToken = hashToken(passwordResetToken);

  // neuen Token erstellen
  const newToken = new Token({
    userId: user._id,
    verificationToken: passwordResetToken,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 Stunde
  })

  try {
    await newToken.save();
  } catch (error) {
    console.log('Fehler beim Erstellen des Tokens...', error);
    return res.status(500).json ({ message: 'Fehler beim Erstellen des Tokens' });
  }

  // Reset link erstellen
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  // Dem User eine E-Mail senden
  const subject = 'Automatisch: Passwort vergessen?';
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = 'noreply@gmail.com';
  const template = 'forgotPassword';
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      url
    );
    res.json({ message: "E-Mail wurde gesendet. Bitte folge den Anweisungen zur Passwortzurücksetzung" });
  } catch (error) {
    console.log("Fehler beim Senden der E-Mail...", error);
    return res
    .status(500)
    .json ({ message: "E-Mail konnte nicht versendet werden" });
  }
});

// reset password
export const resetPassword = asyncHandler (async (req, res) => {
  const { resetPasswordToken} = req.params;
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ message: 'Füge dein neues Passwort hinzu' });
  }

  // hash des verifizierten reset tokens

  const hashedToken = hashToken(resetPasswordToken);

  // check ob der verifizierungs token existiert
  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    // check ob der verifizierungs token abgelaufen ist
    expiresAt: {$gt: Date.now()},
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: 'Abgelaufener Token. Bitte Registrierung neu starten!' });
  }

  // user mit ID aus der Datenbank auswerten
  const user = await User.findById(userToken.userId);

  // update password des users
  user.password = password;
  await user.save();

  res
  .status(200)
  .json ({ message: 'Passwort wurde erfolgreich geändert' });

});

// Password ändern
export const changePassword = asyncHandler (async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Füge dein aktuelles und neues Passwort hinzu' });
  }

  // user mit ID aus der Datenbank auswerten

  const user = await User.findById(req.user._id);

  // vergleiche aktuelles Passwort mit dem in der Datenbank gespeicherten Passwort
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res
    .status (400)
    .json ({ message: 'Falsches Passwort. Bitte versuche es erneut!' });
  }

  // Passwort des Nutzers zurücksetzen
  if (isMatch) {
    user.password = newPassword;
    await user.save();
    return res
    .status (200)
    .json ({ message: 'Passwort wurde erfolgreich geändert' });
  } else {
    return res
    .status (400)
    .json ({ message: 'Falsches Passwort. Bitte versuche es erneut!' });
  }
});