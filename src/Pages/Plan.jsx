import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Switch,
  Textarea,
  Badge,
  VStack,
  HStack,
  Divider,
  Icon,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tag,
  TagLabel,
  TagCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useColorModeValue,
  Tooltip,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCopy,
  FaCheck,
  FaTimes,
  FaDollarSign,
  FaUsers,
  FaDatabase,
  FaShieldAlt,
  FaBolt,
  FaGlobe,
  FaStar,
  FaCrown,
  FaChartLine,
  FaInfinity,
  FaLock,
  FaCloud,
  FaBell,
  FaCog,
  FaEllipsisV,
  FaSave,
  FaUndo,
} from "react-icons/fa";

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        let refreshToken = localStorage.getItem("refresh_token");
        const isSessionStorage = !refreshToken;
        if (!refreshToken) {
          refreshToken = sessionStorage.getItem("refresh_token");
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        if (isSessionStorage) {
          sessionStorage.setItem("access_token", response.data.access);
        } else {
          localStorage.setItem("access_token", response.data.access);
        }
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const PlanManagement = () => {
  const toast = useToast();
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    duration_days: 0,
    max_units: 0,
    max_assets: 0,
    max_users: 0,
    is_active: true,
    is_default: false,
  });

  const [featureInput, setFeatureInput] = useState("");
  const [tempFeatures, setTempFeatures] = useState([]);

  // Plan templates
  const planTemplates = [
    {
      name: "Starter Template",
      description: "Basic plan for small teams",
      tier: "starter",
      monthlyPrice: 0,
      annualPrice: 0,
      limits: {
        users: 5,
        assets: 100,
        storageGB: 1,
        apiCallsPerDay: 100,
        supportLevel: "community",
        retentionDays: 7,
      },
      features: [
        "Basic security",
        "5 users",
        "100 asset units",
        "7-day retention",
      ],
    },
    {
      name: "Business Template",
      description: "Popular plan for growing businesses",
      tier: "basic",
      monthlyPrice: 29,
      annualPrice: 290,
      limits: {
        users: 25,
        assets: 1000,
        storageGB: 10,
        apiCallsPerDay: 1000,
        supportLevel: "email",
        retentionDays: 30,
      },
      features: [
        "Advanced security",
        "Priority processing",
        "Multi-location",
        "Email support",
      ],
    },
    {
      name: "Enterprise Template",
      description: "Full-featured enterprise plan",
      tier: "enterprise",
      monthlyPrice: 199,
      annualPrice: 1990,
      limits: {
        users: 100,
        assets: 10000,
        storageGB: 100,
        apiCallsPerDay: 10000,
        supportLevel: "priority",
        retentionDays: 90,
      },
      features: [
        "Enterprise security",
        "Custom branding",
        "AI analytics",
        "Dedicated support",
      ],
    },
  ];

  // Tier options
  const tierOptions = [
    { value: "starter", label: "Starter", color: "gray", icon: FaUsers },
    { value: "basic", label: "Basic", color: "blue", icon: FaDatabase },
    { value: "pro", label: "Professional", color: "purple", icon: FaStar },
    {
      value: "enterprise",
      label: "Enterprise",
      color: "orange",
      icon: FaCrown,
    },
    { value: "custom", label: "Custom", color: "green", icon: FaCog },
  ];

  // Support levels
  const supportLevels = [
    { value: "community", label: "Community Forum" },
    { value: "email", label: "Email (24h)" },
    { value: "priority", label: "Priority (4h)" },
    { value: "phone", label: "24/7 Phone & Chat" },
    { value: "dedicated", label: "Dedicated Manager" },
  ];

  // Color schemes
  const colorSchemes = [
    "blue",
    "purple",
    "green",
    "orange",
    "red",
    "teal",
    "pink",
    "cyan",
  ];

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/plans/");
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to fetch plans",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSelectTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      tier: template.tier,
      monthlyPrice: template.monthlyPrice,
      annualPrice: template.annualPrice,
      limits: { ...template.limits },
      features: [...template.features],
    });
    setTempFeatures([...template.features]);
    toast({
      title: "Template loaded",
      description: `${template.name} template loaded successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setTempFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    setTempFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addFeature();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tier: "basic",
      monthlyPrice: 0,
      annualPrice: 0,
      isActive: true,
      isPopular: false,
      limits: {
        users: 0,
        assets: 0,
        storageGB: 0,
        apiCallsPerDay: 0,
        supportLevel: "basic",
        retentionDays: 30,
      },
      features: [],
      customFeatures: "",
      billingCycles: ["monthly", "annual"],
      trialDays: 0,
      maxOrganizations: 1,
      colorScheme: "blue",
    });
    setTempFeatures([]);
    setFeatureInput("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Plan name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const planData = {
        name: formData.name,
        price: formData.price,
        duration_days: formData.duration_days,
        max_units: formData.max_units,
        max_assets: formData.max_assets,
        max_users: formData.max_users,
        is_active: formData.is_active,
        is_default: formData.is_default,
      };

      const response = await api.post(`${API_BASE_URL}/api/plans/`, planData);

      toast({
        title: "Plan created",
        description: `${formData.name} has been created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchPlans();
      resetForm();
      onCreateClose();
    } catch (error) {
      console.error("Error creating plan:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create plan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration_days: plan.duration_days,
      max_units: plan.max_units,
      max_assets: plan.max_assets,
      max_users: plan.max_users,
      is_active: true,
      is_default: false,
    });
    setTempFeatures([...plan.features]);
    onEditOpen();
  };

  const handleUpdatePlan = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const planData = {
        name: formData.name,
        price: formData.price,
        duration_days: formData.duration_days,
        max_units: formData.max_units,
        max_assets: formData.max_assets,
        max_users: formData.max_users,
        is_active: formData.is_active,
        is_default: formData.is_default,
      };

      await api.put(`${API_BASE_URL}/api/plans/${selectedPlan.id}/`, planData);

      toast({
        title: "Plan updated",
        description: `${formData.name} has been updated successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchPlans();
      resetForm();
      onEditClose();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update plan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    try {
      setIsSubmitting(true);
      const planName = plans.find((p) => p.id === planId)?.name;

      await api.delete(`${API_BASE_URL}/api/plans/${planId}/`);

      toast({
        title: "Plan deleted",
        description: `${planName} has been deleted successfully`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      await fetchPlans();
      onDeleteClose();
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete plan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const duplicatePlan = async (plan) => {
    try {
      setIsSubmitting(true);
      const duplicatedPlanData = {
        name: `${plan.name} (Copy)`,
        price: plan.price,
        duration_days: plan.duration_days,
        max_units: plan.max_units,
        max_assets: plan.max_assets,
        max_users: plan.max_users,
        is_active: plan.is_active,
        is_default: false,
      };

      await api.post(`${API_BASE_URL}/api/plans/`, duplicatedPlanData);

      toast({
        title: "Plan duplicated",
        description: `${plan.name} has been duplicated`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchPlans();
    } catch (error) {
      console.error("Error duplicating plan:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to duplicate plan",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlanStatus = async (planId) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      const newStatus = !plan.is_active;

      const planData = {
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        max_units: plan.max_units,
        max_assets: plan.max_assets,
        max_users: plan.max_users,
        is_active: newStatus,
        is_default: plan.is_default,
      };

      await api.put(`${API_BASE_URL}/api/plans/${planId}/`, planData);

      toast({
        title: "Plan status updated",
        description: `Plan is now ${newStatus ? "active" : "inactive"}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to toggle plan status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getTierIcon = (tier) => {
    const tierOption = tierOptions.find((t) => t.value === tier);
    return tierOption ? tierOption.icon : FaCog;
  };

  const getTierColor = (tier) => {
    const tierOption = tierOptions.find((t) => t.value === tier);
    return tierOption ? tierOption.color : "gray";
  };

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Container maxW="container.2xl" p={{ base: 4, md: 8 }} pt={{ base: 0, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={2}>
          <Heading as="h1" size="xl" color={headingColor}>
            Plan Management
          </Heading>
          <Text color={textColor}>
            Create, edit, and manage subscription plans for organizations
          </Text>
        </VStack>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          size="sm"
          onClick={onCreateOpen}
        >
          Create New Plan
        </Button>
      </Flex>

      {/* Main Content */}
      <Tabs
        colorScheme="blue"
        isLazy
        onChange={(index) => setActiveTab(["plans", "analytics"][index])}
      >
        <TabList mb={6} gap={10}>
          <Tab>
            <HStack>
              <FaCog />
              <Text>Plans List</Text>
              <Badge colorScheme="blue" ml={2}>
                {plans.length}
              </Badge>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaChartLine />
              <Text>Analytics</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Plans List Tab */}
          <TabPanel p={0}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Subscription Plans</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Spinner size="lg" color="blue.500" />
                      <Text color={textColor}>Loading plans...</Text>
                    </VStack>
                  </Center>
                ) : plans.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Text color={textColor}>No plans found</Text>
                      <Button colorScheme="blue" onClick={onCreateOpen}>
                        Create First Plan
                      </Button>
                    </VStack>
                  </Center>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={4}
                      display={{ base: "grid", lg: "none" }}
                    >
                      {plans.map((plan) => (
                        <Card
                          key={plan.id}
                          variant="outline"
                          _hover={{ shadow: "md" }}
                        >
                          <CardBody>
                            <VStack align="stretch" spacing={3}>
                              <Flex justify="space-between" align="start">
                                <VStack align="start" spacing={1}>
                                  <HStack>
                                    <Text fontWeight="bold" fontSize="lg">
                                      {plan.name}
                                    </Text>
                                    {plan.isPopular && (
                                      <Badge colorScheme="yellow">Popular</Badge>
                                    )}
                                  </HStack>
                                  <Text fontSize="sm" color={textColor} noOfLines={2}>
                                    {plan.description}
                                  </Text>
                                </VStack>
                                <Badge
                                  colorScheme={plan.is_active ? "green" : "red"}
                                  cursor="pointer"
                                  onClick={() => togglePlanStatus(plan.id)}
                                >
                                  {plan.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </Flex>

                              <Divider />

                              <SimpleGrid columns={2} spacing={3}>
                                <Box>
                                  <Text fontSize="xs" color={textColor}>Max Units</Text>
                                  <Text fontWeight="medium">{plan.max_units}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color={textColor}>Max Users</Text>
                                  <Text fontWeight="medium">{plan.max_users}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color={textColor}>Max Assets</Text>
                                  <Text fontWeight="medium">{plan.max_assets}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color={textColor}>Duration</Text>
                                  <Text fontWeight="medium">{plan.duration_days} days</Text>
                                </Box>
                              </SimpleGrid>

                              <Flex justify="space-between" align="center">
                                <Text fontWeight="bold" fontSize="xl" color="blue.600">
                                  {plan.price}
                                </Text>
                                <HStack spacing={1}>
                                  <IconButton
                                    icon={<FaEye />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditPlan(plan)}
                                  />
                                  <IconButton
                                    icon={<FaEdit />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => handleEditPlan(plan)}
                                  />
                                  <IconButton
                                    icon={<FaCopy />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => duplicatePlan(plan)}
                                  />
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<FaEllipsisV />}
                                      size="sm"
                                      variant="ghost"
                                    />
                                    <Portal>
                                      <MenuList>
                                        <MenuItem
                                          icon={<FaTrash />}
                                          color="red.500"
                                          onClick={() => {
                                            setSelectedPlan(plan);
                                            onDeleteOpen();
                                          }}
                                        >
                                          Delete Plan
                                        </MenuItem>
                                      </MenuList>
                                    </Portal>
                                  </Menu>
                                </HStack>
                              </Flex>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>

                    {/* Desktop Table View */}
                    <Box display={{ base: "none", lg: "block" }}>
                      <Table variant="simple">
                    <Thead bg={"gray.200"}>
                      <Tr>
                        <Th color={"gray.800"}>Plan Name</Th>
                        <Th color={"gray.800"} textAlign="center">
                          Max units
                        </Th>
                        <Th color={"gray.800"} textAlign="center">
                          Max users
                        </Th>
                        <Th color={"gray.800"} textAlign="center">
                          Max Assets
                        </Th>
                        <Th color={"gray.800"} textAlign="center">
                          Duration (in days)
                        </Th>
                        <Th color={"gray.800"} textAlign="right">
                          Price
                        </Th>
                        <Th color={"gray.800"} textAlign="center">
                          Status
                        </Th>
                        <Th color={"gray.800"} textAlign="center">
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {plans.map((plan) => (
                        <Tr
                          key={plan.id}
                          _hover={{
                            bg: useColorModeValue("gray.50", "gray.700"),
                          }}
                        >
                          <Td>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Text color={"gray.700"} fontWeight="semibold">
                                  {plan.name}
                                </Text>
                                {plan.isPopular && (
                                  <Badge colorScheme="yellow" size="sm">
                                    Popular
                                  </Badge>
                                )}
                              </HStack>
                              <Text
                                fontSize="sm"
                                color={textColor}
                                noOfLines={1}
                              >
                                {plan.description}
                              </Text>
                            </VStack>
                          </Td>
                          <Td textAlign="center">
                            <HStack justify="center">
                              <Text textTransform="capitalize">
                                {plan.max_units}
                              </Text>
                            </HStack>
                          </Td>
                          <Td textAlign="center">
                            <Text fontWeight="bold">{plan.max_users}</Text>
                          </Td>
                          <Td textAlign="center">
                            <Text fontWeight="bold">{plan.max_assets}</Text>
                          </Td>
                          <Td textAlign="center">
                            <Text fontWeight="bold">{plan.duration_days}</Text>
                          </Td>
                          <Td textAlign="right">
                            <Text fontWeight="bold">{plan.price}</Text>
                          </Td>
                          <Td textAlign="center">
                            <Badge
                              colorScheme={plan.isActive ? "red" : "green"}
                              cursor="pointer"
                              onClick={() => togglePlanStatus(plan.id)}
                              display="inline-flex"
                              justifyContent="center"
                              minW="50px"
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Td>
                          <Td textAlign="center">
                            <HStack justify="center">
                              <IconButton
                                icon={<FaEye />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPlan(plan)}
                              />
                              <IconButton
                                icon={<FaEdit />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleEditPlan(plan)}
                              />
                              <IconButton
                                icon={<FaCopy />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => duplicatePlan(plan)}
                              />
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FaEllipsisV />}
                                  size="sm"
                                  variant="ghost"
                                />
                                <Portal>
                                  <MenuList>
                                    <MenuItem
                                      icon={<FaTrash />}
                                      color="red.500"
                                      onClick={() => {
                                        setSelectedPlan(plan);
                                        onDeleteOpen();
                                      }}
                                    >
                                      Delete Plan
                                    </MenuItem>
                                  </MenuList>
                                </Portal>
                              </Menu>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                    </Box>
                  </>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel p={0}>
            <Card bg={cardBg} border="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Plan Analytics</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Analytics Coming Soon</AlertTitle>
                      <AlertDescription>
                        Plan usage statistics and analytics dashboard will be
                        available in the next update.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Card border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={2}>
                          <Text fontSize="sm" color={textColor}>
                            Most Popular Tier
                          </Text>
                          <Heading size="lg">Pro</Heading>
                          <Text fontSize="sm" color="green.500">
                            45% of organizations
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                    <Card border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={2}>
                          <Text fontSize="sm" color={textColor}>
                            Average Price
                          </Text>
                          <Heading size="lg">$49/mo</Heading>
                          <Text fontSize="sm" color={textColor}>
                            across all plans
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                    <Card border="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={2}>
                          <Text fontSize="sm" color={textColor}>
                            Upgrade Rate
                          </Text>
                          <Heading size="lg">32%</Heading>
                          <Text fontSize="sm" color={textColor}>
                            from free to paid
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Create Plan Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaPlus />
              <Text>Create New Plan</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Left Column - Basic Info */}
              <GridItem>
                <Card bg={cardBg} mb={6}>
                  <CardHeader bg={useColorModeValue("blue.50", "blue.900")}>
                    <Heading size="md">Basic Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Plan Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Business Pro"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Price</FormLabel>
                        <NumberInput
                          value={formData.price}
                          onChange={(value) =>
                            setFormData((prev) => ({ ...prev, price: value }))
                          }
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Duration (In Days)</FormLabel>
                        <NumberInput
                          value={formData.duration_days}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              duration_days: value,
                            }))
                          }
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Right Column - Limits & Features */}
              <GridItem>
                <Card bg={cardBg} mb={6}>
                  <CardHeader bg={useColorModeValue("purple.50", "purple.900")}>
                    <Heading size="md">Plan Limits</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Max Users</FormLabel>
                        <NumberInput
                          value={formData.max_users}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              max_users: value,
                            }))
                          }
                          min={0}
                          max={9999}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Max Units</FormLabel>
                        <NumberInput
                          value={formData.max_units}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              max_units: value,
                            }))
                          }
                          min={0}
                          max={99}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Max Asset Units</FormLabel>
                        <NumberInput
                          value={formData.max_assets}
                          onChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              max_assets: value,
                            }))
                          }
                          min={0}
                          max={9999}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* <Card bg={cardBg}>
                  <CardHeader bg={useColorModeValue('purple.50', 'purple.900')}>
                    <Heading size="md">Plan Features</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Add Features</FormLabel>
                        <HStack>
                          <Input
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., Priority Support"
                          />
                          <Button onClick={addFeature} colorScheme="blue">
                            Add
                          </Button>
                        </HStack>
                      </FormControl>

                      <Box>
                        <FormLabel>Selected Features</FormLabel>
                        <Flex wrap="wrap" gap={2}>
                          {tempFeatures.map((feature, index) => (
                            <Tag
                              key={index}
                              size="md"
                              borderRadius="full"
                              variant="solid"
                              colorScheme="blue"
                            >
                              <TagLabel>{feature}</TagLabel>
                              <TagCloseButton onClick={() => removeFeature(index)} />
                            </Tag>
                          ))}
                          {tempFeatures.length === 0 && (
                            <Text color={textColor} fontSize="sm">
                              No features added yet
                            </Text>
                          )}
                        </Flex>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card> */}
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                leftIcon={<FaUndo />}
                variant="outline"
                onClick={resetForm}
              >
                Reset
              </Button>
              <Button variant="ghost" onClick={onCreateClose}>
                Cancel
              </Button>
              <Button
                leftIcon={<FaSave />}
                colorScheme="blue"
                onClick={handleCreatePlan}
              >
                Create Plan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaEdit />
              <Text>Edit Plan: {selectedPlan?.name}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
              {/* Same form structure as Create Modal */}
              <GridItem>
                <Card bg={cardBg} mb={6}>
                  <CardHeader bg={useColorModeValue("blue.50", "blue.900")}>
                    <Heading size="md">Basic Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Plan Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="e.g., Business Pro"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe this plan for customers"
                          rows={3}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Tier Level</FormLabel>
                        <Select
                          name="tier"
                          value={formData.tier}
                          onChange={handleInputChange}
                        >
                          {tierOptions.map((tier) => (
                            <option key={tier.value} value={tier.value}>
                              {tier.label}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <HStack width="full">
                        <FormControl>
                          <FormLabel>Monthly Price ($)</FormLabel>
                          <NumberInput
                            value={formData.monthlyPrice}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                monthlyPrice: value,
                              }))
                            }
                            min={0}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Annual Price ($)</FormLabel>
                          <NumberInput
                            value={formData.annualPrice}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                annualPrice: value,
                              }))
                            }
                            min={0}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card bg={cardBg}>
                  <CardHeader bg={useColorModeValue("purple.50", "purple.900")}>
                    <Heading size="md">Plan Features</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Add Features</FormLabel>
                        <HStack>
                          <Input
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., Priority Support"
                          />
                          <Button onClick={addFeature} colorScheme="blue">
                            Add
                          </Button>
                        </HStack>
                      </FormControl>

                      <Box>
                        <FormLabel>Selected Features</FormLabel>
                        <Flex wrap="wrap" gap={2}>
                          {tempFeatures.map((feature, index) => (
                            <Tag
                              key={index}
                              size="md"
                              borderRadius="full"
                              variant="solid"
                              colorScheme="blue"
                            >
                              <TagLabel>{feature}</TagLabel>
                              <TagCloseButton
                                onClick={() => removeFeature(index)}
                              />
                            </Tag>
                          ))}
                        </Flex>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onEditClose}>
                Cancel
              </Button>
              <Button
                leftIcon={<FaSave />}
                colorScheme="blue"
                onClick={handleUpdatePlan}
              >
                Update Plan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" borderRadius="md" mb={4}>
              <AlertIcon />
              This action cannot be undone
            </Alert>
            <Text>
              Are you sure you want to delete{" "}
              <strong>{selectedPlan?.name}</strong>? All organizations using
              this plan will need to be migrated.
            </Text>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                leftIcon={<FaTrash />}
                colorScheme="red"
                onClick={() => handleDeletePlan(selectedPlan?.id)}
              >
                Delete Plan
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PlanManagement;
