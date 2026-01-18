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
  FiInfo
} from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = "https://asset-management-backend-7y34.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    let accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      accessToken = sessionStorage.getItem("access_token");
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useDisclosure();
  const menuRef = useRef(null);
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch notifications
  const fetchNotifications = async (showUnread = false) => {
    try {
      setIsLoading(true);
      const endpoint = showUnread 
        ? '/api/notifications/?unread=true' 
        : '/api/notifications/';
      
      const response = await api.get(endpoint);
      setNotifications(response.data);
      
      // Calculate unread count
      const unread = response.data.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/api/notifications/${notificationId}/read/`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true } 
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      toast({
        title: 'Notification marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Mark each unread notification
      const unreadNotifications = notifications.filter(notif => !notif.read);
      await Promise.all(
        unreadNotifications.map(notif => 
          api.post(`/api/notifications/${notif.id}/read/`)
        )
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: 'All notifications marked as read',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Optional: Set up polling for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <FiCheckCircle color="green.500" />;
      case 'warning': return <FiAlertTriangle color="orange.500" />;
      case 'error': return <FiXCircle color="red.500" />;
      case 'info': return <FiInfo color="blue.500" />;
      default: return <BellIcon />;
    }
  };

  return (
    <Menu 
      isOpen={isNotificationsOpen} 
      onClose={onNotificationsClose}
      placement="bottom-end"
    >
      <MenuButton
        as={IconButton}
        colorScheme='blue'
        aria-label="Notifications"
        icon={
          <Box position="relative">
            <BellIcon />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                borderRadius="full"
                colorScheme="red"
                fontSize="2xs"
                minW="5"
                h="5"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Box>
        }
        variant="ghost"
        size="lg"
        borderRadius="full"
        onClick={onNotificationsOpen}
        ref={menuRef}
      />
      
      <MenuList
        maxW="400px"
        maxH="500px"
        overflowY="auto"
        p={0}
        boxShadow="xl"
      >
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Heading size="sm">Notifications</Heading>
            {unreadCount > 0 && (
              <Button
                size="xs"
                colorScheme="blue"
                variant="ghost"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Flex>
        </Box>

        {isLoading ? (
          <Center p={8}>
            <Spinner size="md" color="blue.500" />
          </Center>
        ) : notifications.length === 0 ? (
          <Center p={8}>
            <VStack spacing={2}>
              <BellIcon boxSize={8} color="gray.400" />
              <Text color="gray.500">No notifications</Text>
            </VStack>
          </Center>
        ) : (
          <Box>
            {notifications.slice(0, 10).map((notification) => (
              <MenuItem
                key={notification.id}
                p={0}
                _hover={{ bg: 'transparent' }}
                _focus={{ bg: 'transparent' }}
                onClick={() => markAsRead(notification.id)}
              >
                <Box
                  w="100%"
                  p={3}
                  bg={notification.read ? useColorModeValue('white', 'gray.800') : useColorModeValue('blue.50', 'gray.700')}
                  borderBottom="1px"
                  borderColor={borderColor}
                  _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                >
                  <Flex align="start" gap={3}>
                    <Box mt={1}>
                      {getNotificationIcon(notification.type || 'info')}
                    </Box>
                    <Box flex="1">
                      <Flex justify="space-between" align="start">
                        <Text
                          fontWeight={notification.read ? "normal" : "bold"}
                          fontSize="sm"
                        >
                          {notification.title || 'Notification'}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          {formatTime(notification.created_at || new Date().toISOString())}
                        </Text>
                      </Flex>
                      <Text
                        fontSize="xs"
                        color={textColor}
                        mt={1}
                        noOfLines={2}
                      >
                        {notification.message || 'No message content'}
                      </Text>
                      {notification.data && (
                        <Badge
                          mt={2}
                          colorScheme="blue"
                          fontSize="2xs"
                          variant="subtle"
                        >
                          {notification.data}
                        </Badge>
                      )}
                    </Box>
                    {!notification.read && (
                      <Box
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg="blue.500"
                        mt={1}
                        flexShrink={0}
                      />
                    )}
                  </Flex>
                </Box>
              </MenuItem>
            ))}
            
            {notifications.length > 10 && (
              <Box p={3} textAlign="center">
                <Text fontSize="sm" color={textColor}>
                  Showing 10 of {notifications.length} notifications
                </Text>
                <Button
                  size="xs"
                  variant="link"
                  colorScheme="blue"
                  mt={1}
                  onClick={() => {
                    onNotificationsClose();
                    navigate('/notifications');
                  }}
                >
                  View all
                </Button>
              </Box>
            )}
          </Box>
        )}

        <Box p={3} borderTop="1px" borderColor={borderColor}>
          <Button
            size="sm"
            variant="ghost"
            colorScheme="blue"
            w="100%"
            onClick={() => {
              onNotificationsClose();
              navigate('/notifications');
            }}
          >
            Notification Settings
          </Button>
        </Box>
      </MenuList>
    </Menu>
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
    const allItems = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: FaTachometerAlt,
        description: 'Main dashboard',
        roles: ['org_admin', 'unit_admin', 'service_user', 'viewer']
      },
      {
        name: 'Users',
        path: '/user-management',
        icon: FaUsers,
        description: 'Manage users and permissions',
        roles: ['superadmin', 'org_admin', 'unit_admin']
      },
      {
        name: 'Assets',
        path: '/asset-inventory',
        icon: FiPackage,
        description: 'Manage Asset',
        roles: ['org_admin', 'unit_admin', 'service_user','viewer']
      },
      {
        name: 'Services',
        path: '/services',
        icon: FiTool,
        description: 'Manage Asset',
        roles: ['org_admin', 'unit_admin', 'service_user']
      },
      {
        name: 'AMC/CMC',
        path: '/viewer',
        icon: FaEye,
        description: 'View-only access',
        roles: ['org_admin', 'unit_admin']
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
        roles: ['org_admin', 'unit_admin', 'service_user','viewer' ]
      }
    ];

    return allItems.filter(item => item.roles.includes(userRole));
  };

  const navItems = getNavItems();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
          <HStack spacing={4}>
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
                width={{base:'150px',lg:'150px'}}
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
          <HStack spacing={{ base: 1, md: 3 }}>
            {/* Notification Bell */}
            <NotificationIcon />
            
            {/* History Icon */}
            <Tooltip label="History">
              <IconButton
                colorScheme='blue'
                aria-label="History"
                icon={<FaHistory />}
                variant="ghost"
                size="md"
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
                px={2}
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
      {/* Additional spacer for mobile bottom nav */}
      {isMobile && <Box h="60px" pb="env(safe-area-inset-bottom)" />}
    </>
  );
};

export default Navbar;