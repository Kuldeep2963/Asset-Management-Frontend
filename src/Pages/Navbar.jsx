import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Image,
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  AvatarBadge,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useBreakpointValue,
  Badge,
  Tooltip,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Divider,
  Heading,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  ChevronDownIcon, 
  BellIcon, 
  SettingsIcon 
} from '@chakra-ui/icons';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserShield, 
  FaEye, 
  FaUser, 
  FaSignOutAlt, 
  FaHistory, 
  FaMoneyBill, 
  FaExclamationCircle 
} from 'react-icons/fa';
import { 
  FiPackage, 
  FiTool,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiInfo,
  FiUsers,
  FiBell
} from 'react-icons/fi';
import api from '../services/api';
import ConfirmationModal from '../Components/modals/ConfirmationModal';
import { size } from 'lodash';

const NotificationIcon = () => {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useDisclosure();
  
  // Confirmation Modal State
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
    colorScheme: "red",
  });

  const triggerConfirm = (config) => {
    setConfirmConfig({
      ...config,
      onConfirm: async () => {
        await config.onConfirm();
        onConfirmClose();
      },
    });
    onConfirmOpen();
  };

  const menuRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const unreadBg = useColorModeValue('blue.50', 'rgba(66, 153, 225, 0.1)');

  // Fetch notifications
 const fetchNotifications = async (isSilent = false) => {
  try {
    if (!isSilent) setIsLoading(true);
    
    // Fetch all notifications to keep the badge count accurate
    const response = await api.get('/api/notifications/', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const notificationsData = response.data.results || response.data || [];
    setNotifications(notificationsData);
    
    // Update unread count based on the full list
    const unread = Array.isArray(notificationsData) ? notificationsData.filter(n => !n.is_read).length : 0;
    setUnreadCount(unread);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    toast({
      title: 'Error',
      description: 'Failed to load notifications',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsLoading(false);
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  const notification = notifications.find(n => n.id == notificationId);
  if (!notification || notification.read) return;

  try {
    await api.post(`/api/notifications/${notificationId}/read/`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id == notificationId 
          ? { ...notif, is_read: true } 
          : notif
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    toast({
      title: 'Notification marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to mark notification as read',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

// Mark all as read
const markAllAsRead = async () => {
  try {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length === 0) return;

    // Use bulk update if API supports it, or individual calls
    await Promise.all(
      unreadNotifications.map(notif => 
        api.post(`/api/notifications/${notif.id}/read/`, {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
      )
    );
    
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
    
    setUnreadCount(0);
    
    toast({
      title: 'All caught up!',
      description: 'All notifications marked as read',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    toast({
      title: 'Error',
      description: 'Failed to mark all notifications as read',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

// Delete notification
const deleteNotification = async (e, notificationId) => {
  e.stopPropagation();
  try {
    await api.delete(`/api/notifications/${notificationId}/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    const deletedNotif = notifications.find(n => n.id === notificationId);
    if (deletedNotif && !deletedNotif.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    
    toast({
      title: 'Notification deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete notification',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

// Clear all notifications
const clearAllNotifications = async () => {
  if (notifications.length === 0) return;
  
  triggerConfirm({
    title: 'Clear All Notifications',
    message: 'Are you sure you want to clear all notifications? This action cannot be undone.',
    onConfirm: async () => {
      try {
        // Check if your API supports bulk delete, otherwise delete individually
        await Promise.all(
          notifications.map(notif => api.delete(`/api/notifications/${notif.id}/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }))
        );
        
        setNotifications([]);
        setUnreadCount(0);
        
        toast({
          title: 'Inbox cleared',
          description: 'All notifications have been removed',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error clearing notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear notifications',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  });
};
  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
      const interval = setInterval(() => fetchNotifications(true), 60000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    const iconSize = 20;
    switch(type) {
      case 'success': return <FiCheckCircle size={iconSize} color="var(--chakra-colors-green-500)" />;
      case 'warning': return <FiAlertTriangle size={iconSize} color="var(--chakra-colors-orange-500)" />;
      case 'error': return <FiXCircle size={iconSize} color="var(--chakra-colors-red-500)" />;
      default: return <FiBell size={iconSize} color="var(--chakra-colors-blue-500)" />;
    }
  };

  const filteredNotifications = showUnreadOnly
  ? notifications.filter(n => !n.is_read)
  : notifications;

  return (
    <>
    <Menu 
      isOpen={isNotificationsOpen} 
      onClose={onNotificationsClose}
      placement="bottom-end"
      closeOnSelect={false}
    >
      <MenuButton
        as={IconButton}
        variant="ghost"
        size="md"
        colorScheme='green'
        borderRadius="full"
        onClick={onNotificationsOpen}
        ref={menuRef}
        icon={
          <Box position="relative">
            <BellIcon boxSize={6} />
            {unreadCount > 0 && (
              <Box
                position="absolute"
                top="-1px"
                right="-1px"
                bg="red.500"
                color="white"
                borderRadius="full"
                border="2px solid"
                borderColor={useColorModeValue('white', 'gray.800')}
                fontSize="10px"
                fontWeight="bold"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={1}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Box>
            )}
          </Box>
        }
      />
      
      <MenuList
      mt={3}
      ml={6}
        w={{ base: "calc(100vw - 50px)", md: "400px" }}
        maxH="550px"
        overflow="hidden"
        p={0}
        boxShadow="2xl"
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="md">Notifications</Heading>
            <HStack spacing={2}>
              {unreadCount > 0 && (
                <Tooltip label="Mark all as read">
                  <IconButton
                    size="sm"
                    icon={<FiCheckCircle />}
                    variant="ghost"
                    colorScheme="blue"
                    onClick={markAllAsRead}
                    aria-label="Mark all as read"
                  />
                </Tooltip>
              )}
              <Tooltip label="Clear all">
                <Button
                  size="sm"
                  leftIcon={<FaSignOutAlt/>}
                  variant="ghost"
                  colorScheme="red"
                  onClick={clearAllNotifications}
                  aria-label="Clear all"
                >Clear All
                  </Button>
              </Tooltip>
            </HStack>
          </Flex>
          
          <HStack spacing={4}>
            <Button
              size="xs"
              variant={!showUnreadOnly ? "solid" : "ghost"}
              colorScheme="blue"
              borderRadius="full"
              onClick={() => setShowUnreadOnly(false)}
            >
              All
            </Button>
            <Button
              size="xs"
              variant={showUnreadOnly ? "solid" : "ghost"}
              colorScheme="blue"
              borderRadius="full"
              onClick={() => setShowUnreadOnly(true)}
            >
              Unread
            </Button>
          </HStack>
        </Box>

        <Box overflowY="auto" maxH="400px">
          {isLoading ? (
            <Center p={10}>
              <Spinner color="blue.500" thickness="3px" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center p={10} flexDirection="column">
              <Box 
                p={4} 
                bg={useColorModeValue('gray.50', 'gray.700')} 
                borderRadius="full" 
                mb={3}
              >
                <BellIcon boxSize={8} color="gray.400" />
              </Box>
              <Text fontWeight="medium" color={textColor}>
                No notifications yet
              </Text>
              <Text fontSize="sm" color={secondaryTextColor}>
                We'll notify you when something happens
              </Text>
            </Center>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications
                .filter(n => !showUnreadOnly || !n.is_read)
                .map((notification) => (
                <Box
                  key={notification.id}
                  p={4}
                  bg={notification.is_read ? 'transparent' : unreadBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  transition="all 0.2s"
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => markAsRead(notification.id)}
                  position="relative"
                  role="group"
                >
                  <Flex gap={3}>
                    <Center 
                      flexShrink={0} 
                      w={10} 
                      h={10} 
                      borderRadius="lg" 
                      bg={useColorModeValue('white', 'gray.800')}
                      boxShadow="sm"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      {getNotificationIcon(notification.type)}  
                    </Center>
                    
                    <Box flex="1">
                      <Flex justify="space-between" align="start">
                        <Text
                          fontWeight={notification.is_read ? "semibold" : "bold"}
                          fontSize="sm"
                          color={useColorModeValue('gray.800', 'white')}
                          noOfLines={1}
                        >
                          {notification.title || 'Notification'}
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="xs" color={secondaryTextColor} whiteSpace="nowrap">
                            {formatTime(notification.created_at)}
                          </Text>
                          <IconButton
                            size="xs"
                            icon={<FiXCircle />}
                            variant="ghost"
                            colorScheme="red"
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            onClick={(e) => deleteNotification(e, notification.id)}
                            aria-label="Delete notification"
                          />
                        </HStack>
                      </Flex>
                      <Text
                        fontSize="xs"
                        color={secondaryTextColor}
                        mt={0.5}
                        noOfLines={2}
                        lineHeight="short"
                      >
                        {notification.message}
                      </Text>
                    </Box>
                  </Flex>
                  {!notification.is_read && (
                    <Box
                      position="absolute"
                      left={2}
                      top="50%"
                      transform="translateY(-50%)"
                      w={1.5}
                      h={1.5}
                      borderRadius="full"
                      bg="blue.500"
                    />
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>
        
        <Box p={3} borderTop="1px" borderColor={borderColor}>
          <Button
            w="full"
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => {
              onNotificationsClose();
              navigate('/notifications');
            }}
          >
            View all activity
          </Button>
        </Box>
      </MenuList>
    </Menu>
   
    <ConfirmationModal
      isOpen={isConfirmOpen}
      onClose={onConfirmClose}
      title={confirmConfig.title}
      message={confirmConfig.message}
      onConfirm={confirmConfig.onConfirm}
      colorScheme={confirmConfig.colorScheme}
    />
  </>
  );
};
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  // Get user role from context user
  const userRole = user?.role || '';
  
  const getNavItems = () => {
    if (!user) return [];

  const { role, permissions = {} } = user;
    const allItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: FaTachometerAlt,
        description: 'Main dashboard',
        roles: ['org_admin', 'unit_admin', 'service_user', 'viewer']
        // permissionKey: "can_manage_asset"

      },
      {
        name: 'Users',
        path: '/users',
        icon: FaUsers,
        description: 'Manage users and permissions',
        roles: ['superadmin', 'org_admin', 'unit_admin'],
        permissionKey: "can_manage_users"
      },
      {
        name: 'Assets',
        path: '/assets',
        icon: FiPackage,
        description: 'Manage Asset',
        roles: ['org_admin', 'unit_admin', 'service_user','viewer'],
        permissionKey: "can_manage_assets"
      },
      {
        name: 'Services',
        path: '/services',
        icon: FiTool,
        description: 'Manage Asset',
        roles: ['org_admin', 'unit_admin', 'service_user'],
        permissionKey: "can_manage_assets"
      },
      {
        name: 'AMC/CMC',
        path: '/amc_cmc',
        icon: FaEye,
        description: 'View-only access',
        roles: ['org_admin', 'unit_admin'],
        permissionKey: "can_manage_assets"

      },
      {
        name: 'Subscriptions',
        path: '/subscription',
        icon: FaMoneyBill,
        description: 'View-only access',
        roles: ['org_admin']
      },
      {
        name: 'Subscription Plans',
        path: '/plan',
        icon: FaMoneyBill,
        description: 'View-only access',
        roles: ['superadmin']
      },
      {
        name: 'Issues',
        path: '/issue',
        icon: FaExclamationCircle,
        description: 'View-only access',
        roles: ['org_admin', 'unit_admin', 'service_user','viewer' ],
        permissionKey: "can_manage_assets"

      }
    ];

     return allItems.filter((item) => {
    // ❌ Role not allowed
    if (!item.roles.includes(role)) return false;

    // ✅ Superadmin sees everything
    if (role === "superadmin") return true;

    // 🔐 Permission-based check (only if defined)
    if (
      (role === "org_admin" || role === "unit_admin") &&
      item.permissionKey
    ) {
      return permissions[item.permissionKey] === true;
    }

    return true;
  });
  };

  const navItems = getNavItems();
  const isMobile = useBreakpointValue({ base: true, lg: false });
  
  // Color variables
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  // Find active tab index
  const getActiveTabIndex = () => {
    const index = navItems.findIndex(item => item.path === location.pathname);
    return index >= 0 ? index : 0;
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'superadmin': return 'red';
      case 'admin': return 'purple';
      case 'unitadmin': return 'blue';
      case 'user': return 'green';
      case 'viewer': return 'yellow';
      default: return 'gray';
    }
  };

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'unitadmin': return 'Unit Admin';
      case 'user': return 'User';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  // If user is not logged in, don't show navbar
  if (!user) {
    return null;
  }

  return (
    <>
      <Box 
        as="nav" 
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex="1000"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        height="60px"
        px={{ base: 2, md: 2 }}
        boxShadow="sm"
      >
        <Flex 
          h="100%" 
          alignItems="center" 
          justifyContent="space-between"
          mx="auto"
        >
          {/* Left side: Logo */}
          <HStack spacing={{ base: 2, md: 4 }}>
            {/* Logo/Brand */}
            <HStack 
              as="button" 
              onClick={() => isMobile ? onOpen() : navigate('/dashboard')}
              _hover={{ opacity: 0.8 }}
              cursor="pointer"
              spacing={3}
            >
              <Image
                src='assetcore1.png'
                alt='Asset Management Logo'
                width={{ base: '120px', md: '140px', lg: '150px' }}
                objectFit='contain'
              />
            </HStack>
          </HStack>

          {/* Center: Navigation Tabs - Desktop Only */}
          {!isMobile && navItems.length > 0 && (
            <Flex flex="1" justifyContent="left" mx={8} alignItems="flex-end" h="100%">
              <Tabs 
                variant="line" 
                colorScheme="blue"
                index={getActiveTabIndex()}
                onChange={(index) => {
                  if (navItems[index]) {
                    navigate(navItems[index].path);
                  }
                }}
              >
                <TabList>
                  {navItems.map((item) => (
                    <Tab 
                      key={item.name}
                      mx={1}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <HStack spacing={2}>
                        <item.icon />
                        <Text>{item.name}</Text>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </Flex>
          )}

          {/* Right side: User Menu and Notifications */}
          <HStack spacing={{ base: 1, md: 2, lg: 3 }}>
            {/* Notification Bell */}
            <NotificationIcon />
            
            {/* History Icon */}
            <Tooltip label="History">
              <IconButton
                colorScheme='blue'
                aria-label="History"
                icon={<FaHistory />}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
                borderRadius="full"
                onClick={() => navigate('/history')}
              />
            </Tooltip>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                px={{ base: 1, md: 2 }}
                minW={{ base: "40px", md: "auto" }}
                leftIcon={
                  <Avatar
                    size="sm"
                    name={user.email || user.first_name}
                    src={user.avatar}
                    bg="blue.500"
                    color="white"
                  />
                }
                _hover={{ bg: hoverColor }}
                rightIcon={!isMobile ? <ChevronDownIcon /> : undefined}
              >
                {!isMobile && (
                  <VStack spacing={1} align="end" mr={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {user.first_name} {user.last_name}
                    </Text>
                    <Badge 
                      colorScheme={getRoleBadgeColor(userRole)}
                      fontSize="2xs"
                      px={2}
                      borderRadius="2xl"
                    >
                      {getRoleDisplayName(userRole)}
                    </Badge>
                  </VStack>
                )}
              </MenuButton>
              <MenuList>
                <Box px={3} py={2}>
                  <Text fontWeight="bold" fontSize="sm">{user.email}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {user.first_name} {user.last_name}
                  </Text>
                  <Badge 
                    colorScheme={getRoleBadgeColor(userRole)}
                    fontSize="2xs"
                    mt={1}
                  >
                    {getRoleDisplayName(userRole)}
                  </Badge>
                </Box>
                <MenuDivider />
                <MenuItem 
                  icon={<FaUser />} 
                  onClick={() => navigate('/profile')}
                  fontSize="sm"
                >
                  My Profile
                </MenuItem>
                <MenuItem 
                  icon={<SettingsIcon />} 
                  onClick={() => navigate('/settings')}
                  fontSize="sm"
                >
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem 
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                  color="red.500"
                  _hover={{ bg: 'red.50' }}
                  fontSize="sm"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody pt={12}>
            <VStack spacing={4} align="stretch">
              {/* User Info in Drawer */}
              <HStack spacing={3} p={4} bg={hoverColor} borderRadius="lg">
                <Avatar
                  size="md"
                  name={user.email || user.first_name}
                  src={user.avatar}
                  bg="blue.500"
                  color="white"
                >
                  <AvatarBadge 
                    boxSize="1.25em" 
                    bg={getRoleBadgeColor(userRole)}
                    borderWidth="2px"
                  />
                </Avatar>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {user.first_name || user.email?.split('@')[0]}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {user.email}
                  </Text>
                  <Badge 
                    colorScheme={getRoleBadgeColor(userRole)}
                    fontSize="2xs"
                    mt={1}
                  >
                    {getRoleDisplayName(userRole)}
                  </Badge>
                </VStack>
              </HStack>

              {/* Navigation Items in Drawer */}
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<item.icon />}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  isActive={location.pathname === item.path}
                  _active={{
                    bg: 'blue.50',
                    color: 'blue.600',
                  }}
                  size="lg"
                >
                  {item.name}
                </Button>
              ))}

              <Box pt={4}>
                <Divider mb={4} />
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<FaUser />}
                  onClick={() => {
                    navigate('/profile');
                    onClose();
                  }}
                  size="lg"
                  w="full"
                >
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<SettingsIcon />}
                  onClick={() => {
                    navigate('/settings');
                    onClose();
                  }}
                  size="lg"
                  w="full"
                >
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<FaSignOutAlt />}
                  onClick={handleLogout}
                  color="red.500"
                  _hover={{ bg: 'red.50' }}
                  size="lg"
                  w="full"
                  mt={2}
                >
                  Logout
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Mobile Bottom Navigation Footer */}
      {isMobile && (
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          bg={bgColor}
          borderTop="1px"
          borderColor={borderColor}
          zIndex="1000"
          h="60px"
          boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
          pb="env(safe-area-inset-bottom)"
        >
          <Flex h="100%" align="center" justify="space-around">
            {navItems.slice(0, 4).map((item) => (
              <IconButton
                key={item.name}
                icon={<item.icon />}
                aria-label={item.name}
                variant="ghost"
                color={location.pathname === item.path ? "blue.500" : "gray.500"}
                onClick={() => navigate(item.path)}
                _hover={{ bg: "transparent" }}
                fontSize="xl"
              />
            ))}
            <IconButton
              icon={<HamburgerIcon />}
              aria-label="More"
              variant="ghost"
              color="gray.500"
              onClick={onOpen}
              _hover={{ bg: "transparent" }}
              fontSize="xl"
            />
          </Flex>
        </Box>
      )}

      {/* Spacer for fixed navbar */}
      <Box h="60px" />
    </>
  );
};

export default Navbar;