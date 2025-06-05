'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/app/(components)/Header';
import { useAppDispatch, useAppSelector } from '../redux';
import { setIsDarkMode, logout } from '@/state';
import { useGetCurrentUserQuery, useLogoutMutation, useUpdateUserMutation } from '@/state/api';
import Cookies from 'js-cookie';
import Toast from '../(components)/Toast';

type UserSettings = {
  label: string;
  value: string | boolean;
  type: 'text' | 'toggle';
  disabled?: boolean;
};
const Settings = () => {
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    isError: isUserError,
    refetch,
  } = useGetCurrentUserQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [userSettings, setUserSettings] = useState<UserSettings[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'info';
  } | null>(null);
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Update settings when user data is fetched
  useEffect(() => {
    if (currentUser) {
      setUserSettings([
        { label: 'Name', value: currentUser.name, type: 'text', disabled: false },
        { label: 'Email', value: currentUser.email, type: 'text', disabled: true },
        { label: 'Notification', value: true, type: 'toggle' },
        { label: 'Dark Mode', value: isDarkMode, type: 'toggle' },
      ]);
    }
  }, [currentUser, isDarkMode]);

  const handleNameUpdate = async (newName: string) => {
    if (!newName.trim()) {
      setToast({ message: 'Name cannot be empty.', type: 'error' });
      return;
    }

    if (newName === currentUser?.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateUser({ name: newName.trim() }).unwrap();
      await refetch();
      setToast({ message: 'Name updated successfully.', type: 'success' });
      setIsEditingName(false);
    } catch (error: any) {
      console.error('Update failed:', error);
      setToast({ message: 'Update failed. Please try again.', type: 'error' });
    }
  };

  const handleCancelEdit = () => {
    const settingsCopy = [...userSettings];
    const nameSetting = settingsCopy.find((s) => s.label === 'Name');
    if (nameSetting) {
      nameSetting.value = currentUser?.name || '';
      setUserSettings(settingsCopy);
    }
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    try {
      if (isLoading) {
        return;
      }

      try {
        await logoutMutation().unwrap();
      } catch (error) {
        console.error('Logout failed:', error);
      }

      // Clear refresh token cookie
      Cookies.remove('refresh_token');

      dispatch(logout());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    const setting = settingsCopy[index];

    if (setting.disabled) return;

    if (setting.label === 'Dark Mode') {
      toggleDarkMode();
      setting.value = !isDarkMode;
    } else {
      setting.value = !setting.value;
    }

    setUserSettings(settingsCopy);
  };

  const NAME_MAX_LENGTH = 15;
  const handleTextValueChange = (index: number, value: string) => {
    const settingsCopy = [...userSettings];
    const setting = settingsCopy[index];

    if (setting.disabled) return;

    if (setting.label === 'Name') {
      if (value.length <= NAME_MAX_LENGTH) {
        setting.value = value;
        setUserSettings(settingsCopy);
        setIsEditingName(true);
      }
    } else {
      setting.value = value;
      setUserSettings(settingsCopy);
      setIsEditingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent, value: string) => {
    if (e.key === 'Enter') {
      handleNameUpdate(value);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="w-full">
        <Header name="User Settings" />
        <div className="mt-5 p-4 text-center text-gray-600">Loading user settings...</div>
      </div>
    );
  }

  if (isUserError || !currentUser) {
    return (
      <div className="w-full">
        <Header name="User Settings" />
        <div className="mt-5 p-4 text-center text-red-600">
          Failed to load user settings. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header name="User Settings" />
      {isUpdating && (
        <div className="mt-2 p-2 bg-blue-100 text-blue-700 rounded">Updating name...</div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Settings</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Value</th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.label}>
                <td className="py-2 p-4">{setting.label}</td>
                <td className="py-2 px-4">
                  {setting.type === 'toggle' ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                        aria-label={setting.label}
                        disabled={setting.disabled}
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600 ${
                          setting.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      ></div>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 ${
                          setting.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        value={setting.value as string}
                        onChange={(e) => handleTextValueChange(index, e.target.value)}
                        onKeyDown={(e) =>
                          setting.label === 'Name'
                            ? handleNameKeyDown(e, setting.value as string)
                            : undefined
                        }
                        disabled={setting.disabled || isUpdating}
                      />
                      {setting.label === 'Name' && isEditingName && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleNameUpdate(setting.value as string)}
                            disabled={isUpdating}
                            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {isUpdating ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            <tr className="hover:bg-blue-50">
              <td className="py-2 p-4">Logout</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out shadow-2xl border-black-200">
            <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
