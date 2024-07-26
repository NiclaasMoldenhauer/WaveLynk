import React from 'react';

const globalContext = React.createContext ();

export const GlobalProvider = ({children}) => {
  const [currentView, setCurrentView] = React.useState ('all-Chats');
  const [showFriendProfile, setShowFriendProfile] = React.useState (false);
  const [showProfile, setShowProfile] = React.useState (false);

  const handleProfileToggle = (show) => {
    setShowProfile (show);
  };

  const handleViewChange = (view) => {
    setCurrentView (view);
  };

  const handleFriendProfile = (show) => {
    setShowFriendProfile (show);
  };
  

  return (
    <globalContext.Provider
      value={{
        currentView,
        handleViewChange,
        showProfile,
        handleProfileToggle,
        showFriendProfile,
        handleFriendProfile,
      }}
    >
      {children}
    </globalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return React.useContext (globalContext);
};
