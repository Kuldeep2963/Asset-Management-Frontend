import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Badge,
  Stack,
  VStack,
  HStack,
  Divider,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SimpleGrid,
  Tag,
  Switch,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Alert,
  AlertIcon,
  Center,
  Spinner,
  useToast
} from '@chakra-ui/react';
import {
  FaCheck,
  FaUsers,
  FaDatabase,
  FaShieldAlt,
  FaBolt,
  FaGlobe,
  FaStar,
  FaTrophy,
  FaClock,
  FaQuestionCircle,
  FaCrown,
  FaChartLine,
  FaLock,
  FaInfinity,
  FaArrowRight
} from 'react-icons/fa';

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

const Subscription = () => {
  const toast = useToast();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentFAQ, setCurrentFAQ] = useState('');
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userdata = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userdata ? JSON.parse(userdata) : null;
  
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/plans/');
      const activePlans = response.data.filter(plan => plan.is_active);
      setPlans(activePlans);
      if (activePlans.length > 0 && !selectedPlan) {
        setSelectedPlan(activePlans[0].id);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to fetch plans',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (index) => {
    const icons = [FaUsers, FaDatabase, FaStar, FaCrown];
    return icons[index % icons.length];
  };

  const getPlanColor = (index) => {
    const colors = ['gray', 'blue', 'purple', 'orange'];
    return colors[index % colors.length];
  };

  const hardcodedPlans = {
    starter: {
      name: 'Starter',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for small teams getting started',
      icon: FaUsers,
      color: 'gray',
      features: [
        { icon: FaUsers, text: 'Up to 5 users', included: true },
        { icon: FaDatabase, text: '100 asset units', included: true },
        { icon: FaShieldAlt, text: 'Basic security features', included: true },
        { icon: FaClock, text: '7-day data retention', included: true },
        { icon: FaChartLine, text: 'Basic analytics', included: false },
        { icon: FaGlobe, text: 'Single location', included: true },
      ],
      limits: {
        users: 5,
        assets: '100 units',
        storage: '1 GB',
        support: 'Community forum',
        api: 'Limited calls'
      },
      cta: 'Get Started',
      popular: false
    },
    basic: {
      name: 'Basic',
      price: { monthly: 29, annual: 290 },
      description: 'For growing organizations with expanding needs',
      icon: FaDatabase,
      color: 'blue',
      features: [
        { icon: FaUsers, text: 'Up to 25 users', included: true },
        { icon: FaDatabase, text: '1,000 asset units', included: true },
        { icon: FaShieldAlt, text: 'Advanced security', included: true },
        { icon: FaBolt, text: 'Priority processing', included: true },
        { icon: FaGlobe, text: 'Multi-location support', included: true },
        { icon: FaChartLine, text: 'Advanced analytics', included: false },
        { icon: FaClock, text: '30-day data retention', included: true },
      ],
      limits: {
        users: 25,
        assets: '1,000 units',
        storage: '10 GB',
        support: 'Email (24h response)',
        api: '1,000 calls/day'
      },
      cta: 'Start Free Trial',
      popular: true
    },
    pro: {
      name: 'Professional',
      price: { monthly: 79, annual: 790 },
      description: 'For established organizations with complex needs',
      icon: FaStar,
      color: 'purple',
      features: [
        { icon: FaUsers, text: 'Up to 100 users', included: true },
        { icon: FaDatabase, text: '10,000 asset units', included: true },
        { icon: FaShieldAlt, text: 'Enterprise security + audit', included: true },
        { icon: FaBolt, text: 'Priority processing', included: true },
        { icon: FaGlobe, text: 'Global deployment', included: true },
        { icon: FaChartLine, text: 'Advanced analytics & reporting', included: true },
        { icon: FaTrophy, text: 'Custom branding', included: true },
        { icon: FaClock, text: '90-day data retention', included: true },
      ],
      limits: {
        users: 100,
        assets: '10,000 units',
        storage: '100 GB',
        support: 'Priority (4h response)',
        api: '10,000 calls/day'
      },
      cta: 'Start Free Trial',
      popular: false
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 199, annual: 1990 },
      description: 'For large organizations with unlimited scale needs',
      icon: FaCrown,
      color: 'orange',
      features: [
        { icon: FaUsers, text: 'Unlimited users', included: true },
        { icon: FaDatabase, text: 'Unlimited asset units', included: true },
        { icon: FaShieldAlt, text: 'Enterprise security + compliance', included: true },
        { icon: FaBolt, text: 'Highest priority processing', included: true },
        { icon: FaGlobe, text: 'Global deployment + CDN', included: true },
        { icon: FaChartLine, text: 'AI-powered analytics & insights', included: true },
        { icon: FaTrophy, text: 'Custom workflows & branding', included: true },
        { icon: FaLock, text: 'Dedicated account manager', included: true },
        { icon: FaInfinity, text: 'Unlimited API access', included: true },
      ],
      limits: {
        users: 'Unlimited',
        assets: 'Unlimited',
        storage: '1 TB+',
        support: '24/7 Phone & Chat',
        api: 'Unlimited'
      },
      cta: 'Contact Sales',
      popular: false
    }
  };

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes to higher plans take effect immediately, while downgrades occur at the end of your billing cycle."
    },
    {
      question: "What happens if I exceed my limits?",
      answer: "You'll receive notifications when approaching limits. For asset and user limits, you can either upgrade your plan or contact us for custom solutions. API limits may temporarily throttle requests."
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start. You'll have full access to all features during the trial period."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no penalties. For annual plans, we offer prorated refunds for unused months."
    },
    {
      question: "Do you offer custom plans?",
      answer: "Yes! For organizations with specific needs, we offer custom enterprise plans with tailored limits, features, and pricing. Contact our sales team for details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual enterprise plans."
    }
  ];

  const handleSubscribe = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
   
    try {
      const subscriptionData = {
        plan_id: planId,
        organization_id: user ? user.organization.id : null,
      };

      await api.post(`${API_BASE_URL}/api/subscriptions/assign/`, subscriptionData);
      
      toast({
        title: 'Subscription Successful',
        description: `You have subscribed to ${plan.name} plan`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to subscribe to plan',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openFAQ = (faq) => {
    setCurrentFAQ(faq);
    onOpen();
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');

  return (
    <Container maxW="full" p={{ base: 4, md: 10 }} pt={{ base: 0, md: 10 }} mb={{base:14,md:0}}>
      {/* Header */}
      <VStack spacing={6} textAlign="center" mb={8}>
        <Heading  size="xl" color={headingColor}>
          Choose Your Organization Plan
        </Heading>
        <Text fontSize="md" color={textColor} maxW="3xl">
          Select the perfect plan for your organization's asset management needs. 
          All plans include core features with scalable limits for users and assets.
        </Text>
      </VStack>

      {/* Loading State */}
      {isLoading ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color={textColor}>Loading available plans...</Text>
          </VStack>
        </Center>
      ) : plans.length === 0 ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Text color={textColor} fontSize="lg">No plans available at the moment</Text>
            <Button colorScheme="blue" onClick={fetchPlans}>
              Refresh
            </Button>
          </VStack>
        </Center>
      ) : (
        <>
          {/* Plans Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: Math.min(plans.length, 4) }} spacing={6} mb={12}>
            {plans.map((plan, index) => {
              const planColor = getPlanColor(index);
              const planIcon = getPlanIcon(index);
              
              return (
                <GridItem key={plan.id}>
                  <Card
                    border="2px"
                    borderColor={selectedPlan === plan.id ? `${planColor}.500` : borderColor}
                    bg={cardBg}
                    shadow={selectedPlan === plan.id ? 'xl' : 'md'}
                    transform={selectedPlan === plan.id ? 'translateY(-4px)' : 'none'}
                    transition="all 0.3s"
                    _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
                    cursor="pointer"
                    onClick={() => setSelectedPlan(plan.id)}
                    position="relative"
                    h="full"
                  >
                    {plan.is_default && (
                      <Box position="absolute" top="-3" left="50%" transform="translateX(-50%)">
                        <Badge colorScheme="blue" px={4} py={1} rounded="full" fontSize="sm">
                          Recommended
                        </Badge>
                      </Box>
                    )}
                    
                    <CardHeader pb={4}>
                      <VStack spacing={3}>
                        <Icon as={planIcon} w={10} h={10} color={`${planColor}.500`} />
                        <Heading size="lg" color={headingColor}>
                          {plan.name}
                        </Heading>
                        <Text color={textColor} textAlign="center" fontSize="sm">
                          {plan.description || 'Complete asset management solution'}
                        </Text>
                      </VStack>
                    </CardHeader>

                    <CardBody pt={0}>
                      {/* Pricing */}
                      <Box textAlign="center" mb={6}>
                        <HStack justify="center" align="baseline" spacing={1}>
                          <Heading size="3xl" color={headingColor}>
                            ₹{plan.price}
                          </Heading>
                          <Text color={textColor} fontSize="lg">
                            /{plan.duration_days} days
                          </Text>
                        </HStack>
                        <Text color="green.500" fontSize="sm" mt={1}>
                          ₹{(plan.price / plan.duration_days).toFixed(2)}/day
                        </Text>
                      </Box>

                      {/* Limits Section */}
                      <Box mb={6}>
                        <Heading size="sm" mb={3} color={headingColor}>
                          Plan Limits
                        </Heading>
                        <VStack align="stretch" spacing={2}>
                          <Flex justify="space-between">
                            <Text fontSize="sm" color={textColor}>Max Users</Text>
                            <Badge colorScheme="purple">{plan.max_users}</Badge>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontSize="sm" color={textColor}>Max Units</Text>
                            <Badge colorScheme="blue">{plan.max_units}</Badge>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontSize="sm" color={textColor}>Max Assets</Text>
                            <Badge colorScheme="green">{plan.max_assets}</Badge>
                          </Flex>
                          <Flex justify="space-between">
                            <Text fontSize="sm" color={textColor}>Duration</Text>
                            <Badge colorScheme="orange">{plan.duration_days} days</Badge>
                          </Flex>
                        </VStack>
                      </Box>

                      {/* Features */}
                      <Box>
                        <Heading size="sm" mb={3} color={headingColor}>
                          Key Features
                        </Heading>
                        <VStack align="stretch" spacing={2}>
                          <HStack spacing={2}>
                            <Icon as={FaCheck} color="green.500" w={4} h={4} />
                            <Text fontSize="sm" color={textColor}>
                              Asset tracking & management
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Icon as={FaCheck} color="green.500" w={4} h={4} />
                            <Text fontSize="sm" color={textColor}>
                              User access control
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Icon as={FaCheck} color="green.500" w={4} h={4} />
                            <Text fontSize="sm" color={textColor}>
                              Unit management system
                            </Text>
                          </HStack>
                          <HStack spacing={2}>
                            <Icon as={FaCheck} color="green.500" w={4} h={4} />
                            <Text fontSize="sm" color={textColor}>
                              Real-time reporting
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </CardBody>

                    <CardFooter pt={0}>
                      <Button
                        colorScheme={planColor}
                        size="lg"
                        w="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscribe(plan.id);
                        }}
                        rightIcon={<FaArrowRight />}
                        variant={selectedPlan === plan.id ? 'solid' : 'outline'}
                      >
                        Subscribe Now
                      </Button>
                    </CardFooter>
                  </Card>
                </GridItem>
              );
            })}
          </SimpleGrid>
        </>
      )}

      {/* Selected Plan Summary */}
      {!isLoading && selectedPlan && plans.find(p => p.id === selectedPlan) && (
        <Card bg={highlightColor} border="1px" borderColor="blue.200" mb={12}>
          <CardBody>
            <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align="center" gap={6}>
              <VStack align={{ base: 'center', lg: 'start' }} spacing={2}>
                <Heading size="lg" color={headingColor}>
                  {plans.find(p => p.id === selectedPlan).name} Plan Selected
                </Heading>
                <Text color={textColor}>
                  {plans.find(p => p.id === selectedPlan).duration_days} days • 
                  ${plans.find(p => p.id === selectedPlan).price}
                </Text>
                <HStack flexWrap="wrap" justify={{ base: 'center', lg: 'start' }}>
                  <Tag colorScheme="blue">Max Users: {plans.find(p => p.id === selectedPlan).max_users}</Tag>
                  <Tag colorScheme="green">Max Assets: {plans.find(p => p.id === selectedPlan).max_assets}</Tag>
                  <Tag colorScheme="purple">Max Units: {plans.find(p => p.id === selectedPlan).max_units}</Tag>
                </HStack>
              </VStack>
              
              <Button
                colorScheme="blue"
                size="lg"
                px={12}
                onClick={() => handleSubscribe(selectedPlan)}
                rightIcon={<FaArrowRight />}
              >
                Subscribe to Plan
              </Button>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* FAQ Section */}
      <Box mb={12}>
        <Heading as="h2" size="xl" textAlign="center" mb={8} color={headingColor}>
          Frequently Asked Questions
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {faqs.map((faq, index) => (
            <GridItem key={index}>
              <Card
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                shadow="sm"
                h="full"
                cursor="pointer"
                onClick={() => openFAQ(faq)}
                _hover={{ shadow: 'md', borderColor: 'blue.300' }}
              >
                <CardBody>
                  <HStack spacing={3} align="start">
                    <Icon as={FaQuestionCircle} color="blue.500" mt={1} />
                    <VStack align="start" spacing={2}>
                      <Heading size="sm" color={headingColor}>
                        {faq.question}
                      </Heading>
                      <Text color={textColor} fontSize="sm" noOfLines={3}>
                        {faq.answer}
                      </Text>
                      <Text color="blue.500" fontSize="sm" fontWeight="medium">
                        Read more →
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </SimpleGrid>
      </Box>

      {/* Support CTA */}
      <Center>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          p={8}
          maxW="2xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <Heading size="md" mt={4} mb={2}>
            Need a custom plan?
          </Heading>
          <Text color={textColor} mb={4}>
            Contact our sales team for custom enterprise solutions with tailored limits and features.
          </Text>
          <Button colorScheme="blue" onClick={() => window.open('mailto:kt639539@gmail.com', '_blank')}>
            Contact Sales Team
          </Button>
        </Alert>
      </Center>

      {/* FAQ Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={headingColor}>
            <HStack>
              <Icon as={FaQuestionCircle} color="blue.500" />
              <Text>FAQ Details</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            {currentFAQ && (
              <VStack align="start" spacing={4}>
                <Heading size="md" color={headingColor}>
                  {currentFAQ.question}
                </Heading>
                <Text color={textColor}>{currentFAQ.answer}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Subscription;