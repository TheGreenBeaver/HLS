import React from 'react';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import ws from '../../ws';
import ACTIONS from '../../ws/actions';
import { logOut } from '../../store/actions/account';
import { openProfileModal } from '../../store/actions/general';
import { useDispatch, useSelector } from 'react-redux';
import { usePopover } from '../../util/hooks';
import { Person } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { links } from '../../pages/routing';


function UserMenu() {
  const dispatch = useDispatch();
  const { userData, isAuthorized } = useSelector(state => state.account);
  const { closeMenu, popoverProps, triggerProps } = usePopover();

  function onLogOutClick() {
    closeMenu();
    ws
      .request(ACTIONS.logOut)
      .then(() => dispatch(logOut()))
  }

  function onEditProfileClick() {
    dispatch(openProfileModal());
    closeMenu();
  }

  return (
    <>
      <Avatar
        src={userData?.avatar}
        sx={{ cursor: 'pointer' }}
        {...triggerProps}
      >
        {userData ? userData.username[0] : <Person fontSize='large' />}
      </Avatar>

      <Menu
        sx={{ mt: 1 }}
        MenuListProps={{
          sx: { minWidth: 150 }
        }}
        {...popoverProps}
      >
        {
          userData &&
          [
            <MenuItem
              key='username'
              component={Link}
              to={links.channels.single.get(userData.id)}
              onClick={closeMenu}
            >
              {userData.username}
            </MenuItem>,
            <Divider key='divider' />
          ]
        }
        {
          userData?.isVerified &&
          <MenuItem onClick={onEditProfileClick}>
            Edit profile
          </MenuItem>
        }
        {
          isAuthorized
            ? <MenuItem onClick={onLogOutClick}>
              Log out
            </MenuItem>
            : <MenuItem
              component={Link}
              to={links.auth.signIn.path}
              onClick={closeMenu}
            >
              Sign in
            </MenuItem>
        }
      </Menu>
    </>
  );
}

export default UserMenu;