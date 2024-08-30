import axios from 'axios';
import {useRouter} from 'next/navigation';
import React, {useEffect, useState, useContext} from 'react';
import toast from 'react-hot-toast';

const UserContext = React.createContext ();

// axios credentials
axios.defaults.withCredentials = true;

export const UserContextProvider = ({children}) => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  const router = useRouter ();

  const [user, setUser] = useState ({});
  const [allUsers, setAllUsers] = useState ([]);
  const [userState, setUserState] = useState ({
    name: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState (false);
  const [searchResults, setSearchResults] = useState ([]);

  // register user
  const registerUser = async e => {
    e.preventDefault ();
    if (
      !userState.email.includes ('@') ||
      !userState.password ||
      userState.password.length < 8
    ) {
      toast.error (
        'Gib den Benutzernamen und das Passwort ein! (min 8 Zeichen)'
      );
      return;
    }

    try {
      const res = await axios.post (`${serverUrl}/api/v1/register`, userState);
      console.log ('Registrierung erfolgreich', res.data);
      toast.success ('Registrierung erfolgreich');

      // clear the form
      setUserState ({
        name: '',
        email: '',
        password: '',
      });

      // Umleitung zu Login
      router.push ('/login');
    } catch (error) {
      console.log ('Fehler beim Registrieren', error);
      toast.error (error.response.data.message);
    }
  };

  // login user
  const loginUser = async e => {
    e.preventDefault ();
    try {
      const res = await axios.post (
        `${serverUrl}/api/v1/login`,
        {
          email: userState.email,
          password: userState.password,
        },
        {
          withCredentials: true,
        }
      );

      const setCookieHeader = res.headers['set-cookie'];
      const token =
        setCookieHeader && setCookieHeader.split ('=')[1].split (';')[0];
      localStorage.setItem ('jwtToken', token); // JWT in LocalStorage speichern

      const authToken = localStorage.getItem ('authToken');
      if (authToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }

      toast.success ('Login erfolgreich');

      // clear the form
      setUserState ({
        email: '',
        password: '',
      });

      // refresh user dteails
      await getUser (); // fetch user vor dem redirect

      // push user ins dashboard
      router.push ('/');
    } catch (error) {
      console.log ('Fehler beim Login', error);
      toast.error (error.response?.data?.message) || 'Login fehlgeschlagen';
    }
  };

  // get logged in status
  const userLoginStatus = async () => {
    let loggedIn = false;
    const token = localStorage.getItem ('jwtToken'); // JWT aus dem LocalStorage holen

    if (!token) {
      console.log ('Kein Token gefunden, Benutzer ist nicht authentifiziert');
      router.push ('/login');
      return loggedIn;
    }

    try {
      const res = await axios.get (`${serverUrl}/api/v1/login-status`, {
        withCredentials: true, // ccokies zum server senden
        headers: {
          Authorization: `Bearer ${token}`, // JWT mitgeben
        },
      });

      // cors string zu boolean umwandeln
      loggedIn = !!res.data;
      setLoading (false);

      if (!loggedIn) {
        router.push ('/login');
      }
    } catch (error) {
      console.log ('Fehler bei Statusabfrage', error);
      setLoading (false);
      toast.error (error.response.data.message || 'Fehler bei Statusabfrage');
    }

    return loggedIn;
  };

  // logout user
  const logoutUser = async () => {
    try {
      const res = await axios.get (`${serverUrl}/api/v1/logout`, {
        withCredentials: true, // send cookies to the server
      });

      localStorage.removeItem ('jwtToken'); // JWT aus dem LocalStorage loeschen

      toast.success ('Erfolgreich ausgeloggt!');

      // redirect to login page
      router.push ('/login');
    } catch (error) {
      console.log ('Error logging out user', error);
      toast.error (error.response.data.message);
    }
  };

  // get user details
  const getUser = async () => {
    const token = localStorage.getItem ('jwtToken'); // Token aus localStorage abrufen

    try {
      const res = await axios.get (`${serverUrl}/api/v1/user`, {
        withCredentials: true, // send cookies zum server
        headers: {
          Authorization: `Bearer ${token}`, // JWT-Token im Header mitsenden
        },
      });

      setUser (prevState => {
        return {
          ...prevState,
          ...res.data,
          photo: res.data.photo,
        };
      });

      setLoading (false);
    } catch (error) {
      console.log ('Error getting user', error);
      setLoading (false);
      toast.error (error.response.data.message);
    }
  };

  // update user details
  const updateUser = async data => {
    setLoading (true);

    console.log ('Daten zu Updaten: ', data);

    try {
      const token = localStorage.getItem ('jwtToken');

      const res = await axios.patch (`${serverUrl}/api/v1/user`, data, {
        withCredentials: true, // send cookies zum server
        headers: {
          Authorization: `Bearer ${token}`, // JWT-Token im Header mitsenden
        },
      });

      console.log ('Daten erfolgreich aktualisiert: ', res);

      // update user state
      setUser (prevState => {
        return {
          ...prevState,
          ...res.data,
        };
      });

      toast.success ('Nutzerdaten erfolgreich aktualisiert!');

      setLoading (false);
    } catch (error) {
      console.log ('Fehler beim Updaten!', error);
      setLoading (false);
      toast.error (error.response.data.message);
    }
  };

  // email verification
  const emailVerification = async () => {
    setLoading (true);
    try {
      const res = await axios.post (
        `${serverUrl}/api/v1/verify-email`,
        {},
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Email zur Bestätigung gesendet!');
      setLoading (false);
    } catch (error) {
      console.log ('Fehler beim Senden der Bestätigung', error);
      setLoading (false);
      toast.error (error.response.data.message);
    }
  };

  // verify user/email
  const verifyUser = async token => {
    setLoading (true);
    try {
      const res = await axios.post (
        `${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Erfolgreich verifiziert!');

      // User details aktualisieren
      getUser ();
      setLoading (false);

      // redirect to dashboard
      router.push ('/');
    } catch (error) {
      console.log ('Fehler beim Verifizieren', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // forgot password email
  const forgotPasswordEmail = async email => {
    setLoading (true);

    try {
      const res = await axios.post (
        `${serverUrl}/api/v1/forgot-password`,
        {
          email,
        },
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Email zum Zurücksetzen des Passworts gesendet!');
      setLoading (false);
    } catch (error) {
      console.log (
        'Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts',
        error
      );
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // reset password
  const resetPassword = async (token, password) => {
    setLoading (true);

    try {
      const res = await axios.post (
        `${serverUrl}/api/v1/reset-password/${token}`,
        {
          password,
        },
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Passwort erfolgreich geändert!');
      setLoading (false);
      // redirect to login
      router.push ('/login');
    } catch (error) {
      console.log ('Fehler beim Zurücksetzen des Passworts', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // change password
  const changePassword = async (currentPassword, newPassword) => {
    setLoading (true);

    try {
      const res = await axios.patch (
        `${serverUrl}/api/v1/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Passwort erfolgreich geändert!');
      setLoading (false);
    } catch (error) {
      console.log ('Fehler bei der Passwortänderung', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // admin routes
  const getAllUsers = async () => {
    setLoading (true);
    try {
      const res = await axios.get (
        `${serverUrl}/api/v1/admin/users`,
        {},
        {
          withCredentials: true, // send cookies zum server
        }
      );

      setAllUsers (res.data);
      setLoading (false);
    } catch (error) {
      console.log ('Fehler beim Laden der Nutzer', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // dynamiischer form handler
  const handlerUserInput = name => e => {
    const value = e.target.value;

    setUserState (prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // User löschen
  const deleteUser = async id => {
    setLoading (true);
    try {
      const res = await axios.delete (
        `${serverUrl}/api/v1/admin/user/${id}`,
        {},
        {
          withCredentials: true, // send cookies zum server
        }
      );

      toast.success ('Nutzer gelöscht!');
      setLoading (false);
      // Userliste aktualisieren
      getAllUsers ();
    } catch (error) {
      console.log ('Fehler beim Löschen des Nutzers', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // user suchen
  const searchUsers = async query => {
    setLoading (true);
    try {
      const res = await axios.get (
        `${serverUrl}/api/v1/search-users?q=${query}`,
        {},
        {
          withCredentials: true,
        }
      );

      setSearchResults (res.data);
      setLoading (false);
    } catch (error) {
      console.log ('Fehler beim Suchen des Nutzers', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // freundesanfrage abschicken
  const sendFriendRequest = async id => {
    setLoading (true);
    try {
      const res = await axios.post (`${serverUrl}/api/v1/friend-request`, id, {
        withCredentials: true,
      });

      toast.success ('Freundschaftsanfrage gesendet');

      setLoading (false);
      return res.data;
    } catch (error) {
      console.log ('Fehler beim Absenden der Freundschaftsanfrage', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  // Freundesanfrage annehmen
  const acceptFriendRequest = async id => {
    setLoading (true);
    try {
      const res = await axios.post (`${serverUrl}/api/v1/friends/accept`, id, {
        withCredentials: true,
      });

      toast.success ('Freundschaftsanfrage angenommen');
      // refresh der User Details
      getUser ();

      setLoading (false);
    } catch (error) {
      console.log ('Fehler beim Annehmen der Freundschaftsanfrage', error);
      toast.error (error.response.data.message);
      setLoading (false);
    }
  };

  useEffect (() => {
    const loginStatusGetUser = async () => {
      const isLoggedIn = await userLoginStatus ();

      if (isLoggedIn) {
        await getUser ();
      }
    };

    loginStatusGetUser ();
  }, []);

  // useEffect (
  //   () => {
  //     if (user.role === 'admin') {
  //       getAllUsers ();
  //     }
  //   },
  //   [user.role]
  // );

  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
        allUsers,
        deleteUser,
        searchResults,
        searchUsers,
        setSearchResults,
        sendFriendRequest,
        acceptFriendRequest,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext (UserContext);
};
