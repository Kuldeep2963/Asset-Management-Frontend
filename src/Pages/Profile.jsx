import {
  Box,
  Container,
  VStack,
  HStack,
  Stack,
  Heading,
  Text,
  Avatar,
  Badge,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  MdEmail,
  MdPerson,
  MdBusiness,
  MdGroups,
  MdSecurity,
  MdCalendarToday,
  MdEdit,
} from 'react-icons/md';
import { FaBuilding, FaSitemap, FaShieldAlt } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const user = authUser || (storedUser ? JSON.parse(storedUser) : null);
        
        if (!user) {
          navigate('/');
          return;
        }
        setUserData(user);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          status: 'error',
          duration: 3000,
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, toast, authUser]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'purple';
      case 'supervisor':
        return 'orange';
      case 'technician':
        return 'blue';
      case 'viewer':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
        return 'purple';
      case 'pro':
        return 'blue';
      case 'enterprise':
        return 'green';
      case 'basic':
        return 'gray';
      default:
        return 'teal';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color={primaryColor} />
        </Flex>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>No user data found!</AlertTitle>
          <AlertDescription>
            Please log in again to access your profile.
          </AlertDescription>
        </Alert>
        <Button mt={4} colorScheme="blue" onClick={() => navigate('/')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Container maxW="container.xl" py={8} mb={{base:10,md:0}}>
      {/* Header Section */}
      <Card
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow="lg"
        mb={8}
        overflow="hidden"
      >
        <Box
          h="120px"
          bgGradient="linear(to-r, blue.500, purple.500)"
          position="relative"
        />
        <Flex
          position="relative"
          px={8}
          pb={6}
          alignItems="flex-end"
          transform="translateY(-40px)"
        >
          <Avatar
            size="2xl"
            // name={fullName || userData.email}
            src={null}
            border="4px solid"
            borderColor={bgColor}
            bg={primaryColor}
            color="white"
            fontSize="3xl"
          >
          </Avatar>
          <Box ml={6} flex="1">
            <HStack spacing={4} alignItems="center">
              <Box>
                <Heading  size="xl">{fullName || 'User'}</Heading>
                <Text fontSize="lg" color="gray.600" mt={1}>
                  {userData.email}
                </Text>
              </Box>
              <Badge
                colorScheme={getRoleColor(userData.role)}
                fontSize="lg"
                px={4}
                py={1}
                borderRadius="full"
              >
                {userData.role || 'User'}
              </Badge>
            </HStack>
            <HStack spacing={6} mt={4}>
              <Flex align="center">
                <Icon as={MdCalendarToday} mr={2} color="gray.500" />
                <Text color="gray.600">
                  Last login: {formatDate(userData.last_login)}
                </Text>
              </Flex>
              <Flex align="center">
                <Icon as={MdEmail} mr={2} color="gray.500" />
                <Text color="gray.600">ID: {userData.id}</Text>
              </Flex>
            </HStack>
          </Box>
        </Flex>
      </Card>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        {/* Left Column */}
        <GridItem>
          <Stack spacing={8}>
            {/* Organization Info */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={FaBuilding} color={primaryColor} />
                  <Heading size="md">Organization</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                {userData.organization ? (
                  <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold" fontSize="lg">
                          {userData.organization.name}
                        </Text>
                        <Text color="gray.600">Organization ID: {userData.organization.id}</Text>
                      </Box>
                      <Badge
                        colorScheme={getPlanColor(userData.organization.plan?.name)}
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {userData.organization.plan?.name || 'Standard'}
                      </Badge>
                    </Flex>
                    {userData.organization.plan && (
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <Text fontWeight="bold" mb={2}>Plan Details:</Text>
                        <SimpleGrid columns={2} spacing={4}>
                          <Stat>
                            <StatLabel>Plan Type</StatLabel>
                            <StatNumber>{userData.organization.plan.name}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Status</StatLabel>
                            <StatHelpText color="green.500">Active</StatHelpText>
                          </Stat>
                        </SimpleGrid>
                      </Box>
                    )}
                  </VStack>
                ) : (
                  <Alert status="info" variant="subtle">
                    <AlertIcon />
                    <Text>No organization assigned</Text>
                  </Alert>
                )}
              </CardBody>
            </Card>

            {/* Department & Unit Info */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {userData.unit && (
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardHeader pb={2}>
                    <HStack>
                      <Icon as={FaSitemap} color={primaryColor} />
                      <Heading size="md">Unit</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Text fontWeight="bold" fontSize="lg">{userData.unit.name}</Text>
                      <Text color="gray.600">Unit ID: {userData.unit.id}</Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {userData.departments && userData.departments.length > 0 && (
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardHeader pb={2}>
                    <HStack>
                      <Icon as={MdGroups} color={primaryColor} />
                      <Heading size="md">Departments</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      {userData.departments.map((dept) => (
                        <Box
                          key={dept.id}
                          p={3}
                          bg="gray.50"
                          borderRadius="md"
                          borderLeft="4px solid"
                          borderLeftColor="blue.500"
                        >
                          <Text fontWeight="bold">{dept.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            Department ID: {dept.id}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </SimpleGrid>

            {/* Permissions Section */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={FaShieldAlt} color={primaryColor} />
                  <Heading size="md">Permissions & Access</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box
                    p={4}
                    border="1px solid"
                    borderColor={userData.permissions?.can_manage_users ? 'green.200' : 'gray.200'}
                    borderRadius="md"
                    bg={userData.permissions?.can_manage_users ? 'green.50' : 'gray.50'}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">User Management</Text>
                      <Badge
                        colorScheme={userData.permissions?.can_manage_users ? 'green' : 'gray'}
                      >
                        {userData.permissions?.can_manage_users ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Can create, edit, and delete users
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    border="1px solid"
                    borderColor={userData.permissions?.can_manage_assets ? 'green.200' : 'gray.200'}
                    borderRadius="md"
                    bg={userData.permissions?.can_manage_assets ? 'green.50' : 'gray.50'}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Asset Management</Text>
                      <Badge
                        colorScheme={userData.permissions?.can_manage_assets ? 'green' : 'gray'}
                      >
                        {userData.permissions?.can_manage_assets ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Can manage and modify assets
                    </Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </Stack>
        </GridItem>

        {/* Right Column - User Stats & Quick Actions */}
        <GridItem>
          <Stack spacing={8}>
            {/* User Stats */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={MdPerson} color={primaryColor} />
                  <Heading size="md">User Information</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Stat>
                    <StatLabel>Account Type</StatLabel>
                    <StatNumber fontSize="lg">{userData.role}</StatNumber>
                    <StatHelpText>
                      Member since {formatDate(userData.last_login).split(',')[0]}
                    </StatHelpText>
                  </Stat>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={2}>Personal Details</Text>
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="sm" color="gray.600">First Name</Text>
                        <Text fontWeight="medium">{userData.first_name || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Last Name</Text>
                        <Text fontWeight="medium">{userData.last_name || 'Not set'}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">Email</Text>
                        <Text fontWeight="medium">{userData.email}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.600">User ID</Text>
                        <Text fontWeight="medium">{userData.id}</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={MdEdit} color={primaryColor} />
                  <Heading size="md">Quick Actions</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3}>
                  <Button
                    leftIcon={<MdEmail />}
                    colorScheme="blue"
                    variant="outline"
                    w="full"
                    onClick={() => navigate('/change-email')}
                  >
                    Update Email
                  </Button>
                  <Button
                    leftIcon={<MdSecurity />}
                    colorScheme="purple"
                    variant="outline"
                    w="full"
                    onClick={() => navigate('/security')}
                  >
                    Security Settings
                  </Button>
                  <Button
                    leftIcon={<MdPerson />}
                    colorScheme="green"
                    variant="outline"
                    w="full"
                    onClick={() => navigate('/edit-profile')}
                  >
                    Edit Profile
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader pb={2}>
                <HStack>
                  <Icon as={MdBusiness} color={primaryColor} />
                  <Heading size="md">System Status</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Account Status</Text>
                    <Badge colorScheme="green">Active</Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Last Activity</Text>
                    <Text fontSize="sm">{formatDate(userData.last_login)}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text>Data Sync</Text>
                    <Badge colorScheme="blue">Up to date</Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </Stack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Profile;