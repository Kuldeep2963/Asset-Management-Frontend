import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Tooltip,
  IconButton,
  Switch,
  Tag,
  useToast,
  Spinner,
  Center,
  Avatar,
  Progress,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  AvatarGroup,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Wrap,
  WrapItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiAlertTriangle,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiTool,
  FiUser,
  FiUsers,
  FiActivity,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiChevronRight,
  FiChevronDown,
  FiMoreVertical,
  FiDownload,
  FiPrinter,
  FiShare2,
  FiExternalLink,
  FiUpload,
  FiSettings,
  FiBell,
  FiMapPin,
  FiHardDrive,
  FiCpu,
  FiWifi,
  FiBattery,
  FiShield,
} from 'react-icons/fi';
import { MdOutlineAssignment, MdOutlineWork, MdOutlineReportProblem } from 'react-icons/md';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import UpdateService from '../Components/modals/UpdateService';

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

const Services = () => {
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Modals
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isAssetDrawerOpen, onOpen: onAssetDrawerOpen, onClose: onAssetDrawerClose } = useDisclosure();
  
  // Alert Dialog
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useAlertDisclosure();
  const cancelRef = React.useRef();

  // State
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [serviceUsers, setServiceUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const userdata = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));
  console.log("User Data:", userdata);
  const userRole = userdata.role;
  const cancreateService = ['org_admin', 'unit_admin',].includes(userRole);
  // Form Data
  const [formData, setFormData] = useState({
    asset_id: '',
    service_type: 'maintenance',
    remarks: '',
    service_user: '',
    priority: 'medium',
    estimated_duration: 2,
    status: 'pending',
    asset_search: '',
    user_search: '',
    asset_display: '',
    user_display: '' 
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    thisMonth: 0,
    avgCompletionTime: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAssets();
    fetchServiceUsers();
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      fetchServiceHistory(selectedAssetId);
    }
  }, [selectedAssetId]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`${API_BASE_URL}/api/assets/`);
      setAssets(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assets',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceHistory = async (assetId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/asset-service/${assetId}/service-history/`);
      setServiceHistory(response.data);
    } catch (error) {
      console.error('Error fetching service history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch service history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchServiceUsers = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/api/users/assignable/`);
      const rawData = response.data || [];
      const sortedUsers = rawData
        .map(user => ({
          ...user,
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setServiceUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching service users:', error);
      // Fallback mock data
      setServiceUsers([
        { id: 1, name: 'John Technician', email: 'john@example.com', role: 'technician' },
        { id: 2, name: 'Sarah Engineer', email: 'sarah@example.com', role: 'engineer' },
        { id: 3, name: 'Mike Support', email: 'mike@example.com', role: 'technician' },
        { id: 4, name: 'Lisa Manager', email: 'lisa@example.com', role: 'manager' },
      ].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const calculateStats = (assetsList) => {
    // Calculate statistics based on assets and their service history
    const totalServices = serviceHistory.length;
    const pending = serviceHistory.filter(s => s.status === 'pending').length;
    const inProgress = serviceHistory.filter(s => s.status === 'in_progress').length;
    const completed = serviceHistory.filter(s => s.status === 'completed').length;
    
    const thisMonth = serviceHistory.filter(s => {
      const serviceDate = new Date(s.created_at);
      const now = new Date();
      return serviceDate.getMonth() === now.getMonth() && 
             serviceDate.getFullYear() === now.getFullYear();
    }).length;

    setStats({
      total: totalServices,
      pending,
      inProgress,
      completed,
      overdue: 0, // You might need to calculate this based on deadlines
      thisMonth,
      avgCompletionTime: 2.5, // Mock data - calculate from actual data
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateService = async () => {
    try {
      setIsSubmitting(true);     
      await api.post(`${API_BASE_URL}/api/asset-service/service-asset/`, {
        ...formData,
        asset_id: parseInt(formData.asset_id),
        service_user_id: formData.service_user ? parseInt(formData.service_user) : null,
      });
      
      toast({
        title: 'Service Created',
        description: 'Service request has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (formData.asset_id) {
        await fetchServiceHistory(formData.asset_id);
      }
      
      resetForm();
      onCreateClose();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create service',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    try {
      // Assuming you have a delete endpoint
      // await api.delete(`/api/services/${serviceToDelete.id}/`);
      
      toast({
        title: 'Service Deleted',
        description: 'Service has been deleted successfully',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      if (selectedAssetId) {
        await fetchServiceHistory(selectedAssetId);
      }
      
      onDeleteAlertClose();
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete service',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: selectedAssetId || '',
      service_type: 'maintenance',
      remarks: '',
      service_user: '',
      priority: 'medium',
      estimated_duration: 2,
      status: 'pending',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'yellow',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red',
      on_hold: 'orange',
    };
    
    const icons = {
      pending: FiClock,
      in_progress: FiActivity,
      completed: FiCheckCircle,
      cancelled: FiXCircle,
      on_hold: FiAlertTriangle,
    };
    
    const labels = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      on_hold: 'On Hold',
    };
    
    const Icon = icons[status] || FiClock;
    
    return (
      <Badge colorScheme={colors[status] || 'gray'} display="flex" alignItems="center" gap={1}>
        <Icon size={12} />
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    
    return (
      <Badge colorScheme={colors[priority] || 'gray'} textTransform="capitalize">
        {priority}
      </Badge>
    );
  };

  const getAssetIcon = (assetType) => {
    const icons = {
      computer: FiCpu,
      server: FiHardDrive,
      network: FiWifi,
      medical: FiActivity,
      general: FiTool,
    };
    
    const Icon = icons[assetType?.toLowerCase()] || FiTool;
    return <Icon />;
  };

  const filteredServiceHistory = serviceHistory
    .filter(service => {
      const matchesSearch = 
        service.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.service_type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
      const matchesType = filterType === 'all' || service.service_type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.priority] || 4;
        bValue = priorityOrder[b.priority] || 4;
      } else {
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleAssetSelect = (assetId) => {
    setSelectedAssetId(assetId);
    const asset = assets.find(a => a.id === parseInt(assetId));
    setSelectedAsset(asset);
    fetchServiceHistory(assetId);
  };

  const StatsCards = () => (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 7 }} spacing={4} mb={8}>
      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiTool} color="blue.500" /> Total Services
            </StatLabel>
            <StatNumber color="blue.500">{stats.total}</StatNumber>
            <StatHelpText>All time</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiClock} color="yellow.500" /> Pending
            </StatLabel>
            <StatNumber color="yellow.500">{stats.pending}</StatNumber>
            <StatHelpText>Awaiting action</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiActivity} color="blue.500" /> In Progress
            </StatLabel>
            <StatNumber color="blue.500">{stats.inProgress}</StatNumber>
            <StatHelpText>Being serviced</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems=" center" gap={2}>
              <Icon as={FiCheckCircle} color="green.500" /> Completed
            </StatLabel>
            <StatNumber color="green.500">{stats.completed}</StatNumber>
            <StatHelpText>This month: {stats.thisMonth}</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiAlertTriangle} color="red.500" /> Overdue
            </StatLabel>
            <StatNumber color="red.500">{stats.overdue}</StatNumber>
            <StatHelpText>Past deadline</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiUsers} color="purple.500" /> Technicians
            </StatLabel>
            <StatNumber color="purple.500">{serviceUsers.length}</StatNumber>
            <StatHelpText>Available</StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      <Card bg={cardBg} border="1px" borderColor={borderColor} _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}>
        <CardBody>
          <Stat>
            <StatLabel display="flex" alignItems="center" gap={2}>
              <Icon as={FiTrendingUp} color="teal.500" /> Avg. Time
            </StatLabel>
            <StatNumber color="teal.500">{stats.avgCompletionTime}h</StatNumber>
            <StatHelpText>Completion time</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );

  return (
    <Box bg={bgColor} minH="100vh" mb={{base:8,md:0}}>
      <Container maxW="container.2xl" py={{ base: 4, md: 8 }} pt={{ base: 0, md: 8 }}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={8} flexDirection={{base:"column",md:"row"}}>
          <VStack align="start" spacing={1} mb={4}>
            <Heading as="h1" size={{base:"lg",md:"xl"}} color={headingColor}>
              Asset Service Management
            </Heading>
            <Text color={textColor}>
              Create, assign, and track service requests for your assets
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button size={"sm"} leftIcon={<FiRefreshCw />} variant="outline" onClick={fetchAssets} isLoading={isLoading}>
              Refresh
            </Button>
            <Button size={"sm"} leftIcon={<FiDownload /> } variant="outline" colorScheme="blue">
              Export
            </Button>
            {cancreateService && (<Button size={"sm"} leftIcon={<FiPlus />} colorScheme="blue" onClick={onCreateOpen}>
              New Service
            </Button>)}
          </HStack>
        </Flex>

        {/* Stats Cards */}
        <StatsCards />

        {/* Asset Selection Card */}
        <Card bg={cardBg} border="1px" borderColor={borderColor} mb={8}>
          <CardHeader>
            <Heading size="md">Select Asset</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Choose Asset to View Service History</FormLabel>
                <Select
                  placeholder="Select an asset"
                  value={selectedAssetId}
                  onChange={(e) => handleAssetSelect(e.target.value)}
                >
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_id} - {asset.asset_name} ({asset.category})
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              {selectedAsset && (
                <Card variant="outline" borderColor="blue.200">
                  <CardBody>
                    <Flex justify="space-between" align="left" gap={3} flexDirection={{base:"column",md:"row"}}>
                      <HStack spacing={4}>
                        <Avatar boxSize={10} icon={getAssetIcon(selectedAsset.category)} bg="blue.100" color="blue.600" />
                        <VStack align="start" spacing={1}>
                          <Heading size="md">{selectedAsset.name}</Heading>
                          <Text color={textColor}>Serial: {selectedAsset.serial_number}</Text>
                          <HStack>
                            <Badge colorScheme="blue">{selectedAsset.category}</Badge>
                            <Badge colorScheme={selectedAsset.status === 'active' ? 'green' : 'red'}>
                              {selectedAsset.status}
                            </Badge>
                            <Badge colorScheme="purple">Location: {selectedAsset.location}</Badge>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Button
                        size={"sm"}
                        variant="outline"
                        leftIcon={<FiEye />}
                        onClick={onAssetDrawerOpen}
                      >
                        View Details
                      </Button>
                    </Flex>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Main Service History Card */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="md">Service History</Heading>
                <Text color={textColor} fontSize="sm">
                  {selectedAsset ? `Services for ${selectedAsset.name}` : 'Select an asset to view service history'}
                </Text>
              </VStack>
              
              <HStack spacing={4}>
                {/* Search */}
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </InputGroup>
                
                {/* Filters */}
                <HStack spacing={3}>
                  <Select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    width="100px"
                  >
                    <option value="all">All Status</option>
                    <option value="closed">Closed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="open">Open</option>
                  </Select>
                  
                  <Select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    width="100px"
                  >
                    <option value="all">All Types</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="calibration">Calibration</option>
                  </Select>
                  
                  
                </HStack>
              </HStack>
            </Flex>
          </CardHeader>
          
          <CardBody>
            {!selectedAssetId ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Icon as={FiTool} boxSize={{base:8,md:16}} color="gray.400" />
                  <Text color={textColor} fontSize={{base:"md",md:"lg"}}>Select an asset to view service history</Text>
                  <Text color={textColor} fontSize="sm">Choose an asset from the dropdown above</Text>
                </VStack>
              </Center>
            ) : isLoading ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                  <Text color={textColor}>Loading service history...</Text>
                </VStack>
              </Center>
            ) : filteredServiceHistory.length === 0 ? (
              <Center py={20}>
                <VStack spacing={4}>
                  <Icon as={FiFileText} boxSize={16} color="gray.400" />
                  <Text color={textColor} fontSize="lg">No service history found</Text>
                  <Text color={textColor} fontSize="sm">
                    {searchQuery ? 'Try a different search term' : 'Create your first service request for this asset'}
                  </Text>
                  <Button colorScheme="blue" onClick={onCreateOpen} leftIcon={<FiPlus />}>
                    Create Service Request
                  </Button>
                </VStack>
              </Center>
            ) : (
              <>
                {/* Mobile Card View */}
                <SimpleGrid columns={1} spacing={4} display={{ base: 'grid', md: 'none' }}>
                  {filteredServiceHistory.map((service) => (
                    <Card key={service.id} border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <Flex justify="space-between" align="center">
                            <Tag colorScheme="blue" textTransform="capitalize">
                              {service.service_type}
                            </Tag>
                            {getStatusBadge(service.status)}
                          </Flex>
                          
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">Remarks:</Text>
                            <Text fontSize="sm" color={textColor}>{service.remarks}</Text>
                          </Box>

                          <SimpleGrid columns={2} spacing={2}>
                            <Box>
                              <Text fontWeight="bold" fontSize="xs">Created:</Text>
                              <Text fontSize="xs">
                                {format(parseISO(service.created_at), 'MMM dd, yyyy')}
                              </Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" fontSize="xs">Priority:</Text>
                              {getPriorityBadge(service.priority)}
                            </Box>
                          </SimpleGrid>

                          <Divider />

                          <Flex justify="space-between" align="center">
                            <HStack>
                              {service.service_user ? (
                                <HStack>
                                  <Avatar size="xs" name={service.service_user.name} />
                                  <Text fontSize="xs">{service.service_user.name}</Text>
                                </HStack>
                              ) : (
                                <Text color={textColor} fontSize="xs">Unassigned</Text>
                              )}
                            </HStack>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="outline"
                                onClick={() => {/* Handle view */}}
                              />
                              <IconButton
                                icon={<FiEdit />}
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedService(service);
                                  onEditOpen();
                                }}
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => {
                                  setServiceToDelete(service);
                                  onDeleteAlertOpen();
                                }}
                              />
                            </HStack>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                {/* Desktop Table View */}
                <TableContainer display={{ base: 'none', md: 'block' }}>
                  <Table variant="simple">
                  <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                    <Tr>
                      <Th>
                        <Flex align="center" gap={2}>
                           Created Date
                          <Icon as={FiChevronDown} cursor="pointer" 
                            onClick={() => {
                              setSortBy('created_at');
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            }} 
                          />
                        </Flex>
                      </Th>
                      <Th>Service Type</Th>
                      <Th>Priority</Th>
                      <Th>Assigned To</Th>
                      <Th>Remarks</Th>
                      <Th>Serviced Date</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredServiceHistory.map((service) => (
                      <Tr 
                        key={service.id} 
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.900') }}
                      >
                        <Td>
                          <VStack align="start" spacing={1}>
                             <Text>
                              {format(parseISO(service.created_at), 'MMM dd, yyyy')}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {format(parseISO(service.created_at), 'hh:mm a')}
                            </Text> 
                          </VStack>
                        </Td>
                        <Td>
                          <Tag colorScheme="blue" textTransform="capitalize">
                            {service.service_type}
                          </Tag>
                        </Td>
                        <Td>{getPriorityBadge(service.priority)}</Td>
                        <Td>
                          {service.service_user ? (
                            <HStack>
                              <Avatar size="xs" name={service.service_user.name} />
                              <Text fontSize="sm">{service.service_user.first_name} {service.service_user.last_name}</Text>
                            </HStack>
                          ) : (
                            <Text color={textColor} fontSize="sm">Unassigned</Text>
                          )}
                        </Td>
                        <Td>
                          { service.remarks ? (<Tooltip label={service.remarks}>
                            <Text noOfLines={1} maxW="200px">
                              {service.remarks}
                            </Text>
                          </Tooltip>) : <Text fontStyle={"italic"} color={"gray.500"}>No Remark</Text>}
                        </Td>
                        <Td>
                        {service.serviced_at ? (
                          <VStack align="start" spacing={1}>
                             <Text>
                              {format(parseISO(service.serviced_at), 'MMM dd, yyyy')}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {format(parseISO(service.serviced_at), 'hh:mm a')}
                            </Text> 
                          </VStack>
                        ): <Text fontStyle={"italic"} color={"gray.500"} >not serviced</Text>}</Td>
                        <Td>{getStatusBadge(service.status)}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<FiEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  // Handle view details
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Edit">
                              {!(userRole == "service_user" && service.service_user.id != userdata.id) && <IconButton
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedService(service);
                                  onEditOpen();
                                }}
                              />}
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => {
                                  setServiceToDelete(service);
                                  onDeleteAlertOpen();
                                }}
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              </>
            )}
            
          </CardBody>
        </Card>

        {/* Create Service Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Create New Service Request</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack spacing={6}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4} width="100%">
          {/* Asset - Searchable Dropdown */}
          <FormControl isRequired>
            <FormLabel>Asset</FormLabel>
            <Box position="relative">
              <Input
                placeholder="Search assets..."
                value={formData.asset_display || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    asset_search: value,
                    asset_display: value
                  }));
                  setIsAssetDropdownOpen(true);
                }}
                onFocus={() => setIsAssetDropdownOpen(true)}
                onBlur={() => {
                  // Use requestAnimationFrame to ensure click event fires first
                  requestAnimationFrame(() => {
                    setTimeout(() => setIsAssetDropdownOpen(false), 200);
                  });
                }}
              />
              {isAssetDropdownOpen && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  zIndex={10}
                  maxH="200px"
                  overflowY="auto"
                  mt={1}
                  boxShadow="lg"
                >
                  {assets
                    .filter(asset => {
                      if (!formData.asset_search) return true;
                      const searchTerm = formData.asset_search.toLowerCase();
                      return (
                        asset.asset_id.toLowerCase().includes(searchTerm) ||
                        asset.asset_name.toLowerCase().includes(searchTerm)
                      );
                    })
                    .map(asset => (
                      <Box
                        key={asset.id}
                        p={2}
                        _hover={{ bg: "gray.100", cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          setFormData(prev => ({ 
                            ...prev, 
                            asset_id: asset.id,
                            asset_display: `${asset.asset_id} (${asset.asset_name})`,
                            asset_search: ""
                          }));
                          setIsAssetDropdownOpen(false);
                        }}
                      >
                        {asset.asset_id} ({asset.asset_name})
                      </Box>
                    ))}
                </Box>
              )}
              <Input type="hidden" name="asset_id" value={formData.asset_id} />
            </Box>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Service Type</FormLabel>
            <Select
              name="service_type"
              value={formData.service_type}
              onChange={handleInputChange}
            >
              <option value="maintenance">Preventive Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="calibration">Calibration</option>
              <option value="installation">Installation</option>
              <option value="upgrade">Upgrade</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Priority</FormLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </FormControl>

          {/* Assign To - Searchable Dropdown */}
          <FormControl>
            <FormLabel>Assign To</FormLabel>
            <Box position="relative">
              <Input
                placeholder="Search technicians..."
                value={formData.user_display || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    user_search: value,
                    user_display: value
                  }));
                  setIsUserDropdownOpen(true);
                }}
                onFocus={() => setIsUserDropdownOpen(true)}
                onBlur={() => {
                  requestAnimationFrame(() => {
                    setTimeout(() => setIsUserDropdownOpen(false), 200);
                  });
                }}
              />
              {isUserDropdownOpen && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  zIndex={10}
                  maxH="200px"
                  overflowY="auto"
                  mt={1}
                  boxShadow="lg"
                >
                  {serviceUsers
                    .filter(user => {
                      if (!formData.user_search) return true;
                      const searchTerm = formData.user_search.toLowerCase();
                      return (
                        user.name.toLowerCase().includes(searchTerm) ||
                        user.role.toLowerCase().includes(searchTerm)
                      );
                    })
                    .map(user => (
                      <Box
                        key={user.id}
                        p={2}
                        _hover={{ bg: "gray.100", cursor: "pointer" }}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          setFormData(prev => ({ 
                            ...prev, 
                            service_user: user.id,
                            user_display: `${user.name} (${user.role})`,
                            user_search: ""
                          }));
                          setIsUserDropdownOpen(false);
                        }}
                      >
                        {user.name} ({user.role})
                      </Box>
                    ))}
                </Box>
              )}
              <Input type="hidden" name="service_user" value={formData.service_user} />
            </Box>
          </FormControl>

          <FormControl>
            <FormLabel>Estimated Duration (hours)</FormLabel>
            <Select
              name="estimated_duration"
              value={formData.estimated_duration}
              onChange={handleInputChange}
            >
              <option value={1}>1 hour</option>
              <option value={2}>2 hours</option>
              <option value={4}>4 hours</option>
              <option value={8}>8 hours (1 day)</option>
              <option value={16}>16 hours (2 days)</option>
              <option value={24}>24 hours (3 days)</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Initial Status</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="closed">Closed</option>
              <option value="open">Open</option>
              <option value="on_hold">On Hold</option>
            </Select>
          </FormControl>
        </Grid>

        <FormControl isRequired width="100%">
          <FormLabel>Remarks / Description</FormLabel>
          <Textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Describe the service required, any specific issues, or special instructions..."
            rows={4}
          />
        </FormControl>
      </VStack>
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={onCreateClose}>
        Cancel
      </Button>
      <Button 
        colorScheme="blue" 
        onClick={handleCreateService}
        isLoading={isSubmitting}
        loadingText="Creating..."
      >
        Create Service Request
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

        {/* Update Service Modal */}
        <UpdateService
          service={selectedService}
          isOpen={isEditOpen}
          onClose={onEditClose}
          serviceUsers={serviceUsers}
          onSuccess={() => {
            if (selectedAssetId) {
              fetchServiceHistory(selectedAssetId);
            }
          }}
        />

        {/* Asset Details Drawer */}
        <Drawer isOpen={isAssetDrawerOpen} placement="right" onClose={onAssetDrawerClose} size="md">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <VStack align="stretch" spacing={2}>
                <Heading size="lg">Asset Details</Heading>
                <Text color={textColor} fontSize="sm">Complete asset information</Text>
              </VStack>
            </DrawerHeader>
            <DrawerBody>
              {selectedAsset && (
                <VStack align="stretch" spacing={6}>
                  <Center>
                    <Avatar size="2xl" icon={getAssetIcon(selectedAsset.category)} bg="blue.100" color="blue.600" />
                  </Center>
                  
                  <Divider />
                  
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontSize="sm" color={textColor}>Asset Name</Text>
                      <Text fontWeight="bold" fontSize="lg">{selectedAsset.name}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color={textColor}>Serial Number</Text>
                      <Text>{selectedAsset.serial_number}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color={textColor}>Category</Text>
                      <Badge colorScheme="blue">{selectedAsset.category}</Badge>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color={textColor}>Status</Text>
                      <Badge colorScheme={selectedAsset.status === 'active' ? 'green' : 'red'}>
                        {selectedAsset.status}
                      </Badge>
                    </Box>
                    
                    <Box>
                      <Text fontSize="sm" color={textColor}>Location</Text>
                      <Text>{selectedAsset.location}</Text>
                    </Box>
                    
                    {/* <Box>
                      <Text fontSize="sm" color={textColor}>Purchase Date</Text>
                      <Text>{format(parseISO(selectedAsset.purchase_date), 'MMM dd, yyyy')}</Text>
                    </Box> */}
                    
                    {selectedAsset.warranty_expiry && (
                      <Box>
                        <Text fontSize="sm" color={textColor}>Warranty Expiry</Text>
                        <Text>{format(parseISO(selectedAsset.warranty_expiry), 'MMM dd, yyyy')}</Text>
                      </Box>
                    )}
                    
                    {selectedAsset.notes && (
                      <>
                        <Divider />
                        <Box>
                          <Text fontSize="sm" color={textColor}>Notes</Text>
                          <Text>{selectedAsset.notes}</Text>
                        </Box>
                      </>
                    )}
                  </VStack>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb={3}>Quick Actions</Heading>
                    <VStack align="stretch" spacing={2}>
                      <Button 
                        leftIcon={<FiPlus />} 
                        colorScheme="blue"
                        onClick={() => {
                          onAssetDrawerClose();
                          onCreateOpen();
                        }}
                      >
                        Create Service Request
                      </Button>
                      <Button leftIcon={<FiFileText />} variant="outline">
                        View Full History
                      </Button>
                      <Button leftIcon={<FiDownload />} variant="outline">
                        Export Asset Data
                      </Button>
                    </VStack>
                  </Box>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Delete Confirmation Alert */}
        <AlertDialog
          isOpen={isDeleteAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteAlertClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Service Request
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete this service request? This action cannot be undone.
                {serviceToDelete && (
                  <Text mt={2} fontSize="sm" color={textColor}>
                    Service ID: {serviceToDelete.id} • Type: {serviceToDelete.service_type}
                  </Text>
                )}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteService} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default Services;