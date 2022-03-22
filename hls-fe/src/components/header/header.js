import React, { useRef, useState } from 'react';
import { useUserData } from '../../store/selectors';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ws from '../../ws';
import ACTIONS from '../../ws/actions';
import { useDispatch } from 'react-redux';
import { logOut } from '../../store/actions/account';
import { openProfileModal } from '../../store/actions/general';
import Box from '@mui/material/Box';


function Header() {
  const dispatch = useDispatch();
  const { avatar, username, isVerified } = useUserData();
  const avatarRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

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
      <Box position='fixed' top={0} right={0} pr={3} pt={2} zIndex='appBar'>
        <Avatar
          src={avatar}
          ref={avatarRef}
          onClick={() => setMenuOpen(true)}
          sx={{ cursor: 'pointer' }}
        >
          {username[0]}
        </Avatar>
      </Box>

      <Menu
        sx={{ mt: 1 }}
        open={menuOpen}
        anchorEl={avatarRef.current}
        onClose={closeMenu}
        MenuListProps={{
          sx: { minWidth: 150 }
        }}
      >
        <MenuItem>
          {username}
        </MenuItem>
        <Divider />
        {
          isVerified &&
          <MenuItem onClick={onEditProfileClick}>
            Edit profile
          </MenuItem>
        }
        <MenuItem onClick={onLogOutClick}>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default Header;