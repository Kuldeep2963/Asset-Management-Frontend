// LandingPage.jsx
import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Container,
  Heading,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Icon,
  Stack,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useBreakpointValue,
  Card,
  CardBody,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Badge,
  Link,
  SimpleGrid,
  Center,
  Fade,
  ScaleFade,
  SlideFade,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  CheckIcon,
  EmailIcon,
  LockIcon,
  ViewIcon,
  ViewOffIcon,
  StarIcon,
  TimeIcon,
  SettingsIcon,
  ChatIcon,
  ExternalLinkIcon,
  HamburgerIcon,
} from '@chakra-ui/icons';
import { FaShieldAlt, FaChartLine, FaUsers, FaMobileAlt, FaCloud, FaLock, FaUserCheck } from 'react-icons/fa';
import { GiProcessor } from 'react-icons/gi';
import { MdDashboard, MdSecurity, MdSupportAgent } from 'react-icons/md';

// Import your existing LoginPage component
import LoginPage from './Login';

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isNavOpen, onOpen: onNavOpen, onClose: onNavClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Features data
  const features = [
    {
      icon: FaShieldAlt,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and multi-factor authentication to protect your data',
      color: 'blue.500'
    },
    {
      icon: FaChartLine,
      title: 'Advanced Analytics',
      description: 'Real-time insights and customizable dashboards for data-driven decisions',
      color: 'green.500'
    },
    {
      icon: FaUsers,
      title: 'Role-Based Access',
      description: 'Granular permissions for superadmins, admins, users, and viewers',
      color: 'purple.500'
    },
    {
      icon: GiProcessor,
      title: 'AI-Powered Insights',
      description: 'Smart recommendations and predictive analytics powered by AI',
      color: 'orange.500'
    },
    {
      icon: FaMobileAlt,
      title: 'Mobile Responsive',
      description: 'Access your dashboard from any device with full functionality',
      color: 'teal.500'
    },
    {
      icon: FaCloud,
      title: 'Cloud Native',
      description: 'Scalable cloud infrastructure with 99.9% uptime guarantee',
      color: 'cyan.500'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: 'What is AssetCore?',
      answer: 'AssetCore is a comprehensive asset management platform designed for organizations to track, manage, and optimize their assets with advanced security features and role-based access control.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We use military-grade AES-256 encryption, regular security audits, multi-factor authentication, and comply with industry security standards to ensure your data remains protected.'
    },
    {
      question: 'Can I try before committing?',
      answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start your trial.'
    },
    {
      question: 'What roles are available?',
      answer: 'AssetCore supports Super Admin, Organization Admin, Unit Admin, User, and Viewer roles with granular permission controls for each.'
    },
    {
      question: 'Is there mobile access?',
      answer: 'Yes, our platform is fully responsive and works seamlessly on mobile devices, tablets, and desktops.'
    },
    {
      question: 'How do I get support?',
      answer: 'We offer 24/7 email support, detailed documentation, video tutorials, and priority phone support for enterprise customers.'
    }
  ];

  // Stats data
  const stats = [
    { value: '99.9%', label: 'Uptime', icon: TimeIcon },
    { value: '500+', label: 'Active Users', icon: FaUsers },
    { value: 'A+', label: 'Security Grade', icon: MdSecurity },
    { value: '24/7', label: 'Support', icon: MdSupportAgent }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'IT Director, TechCorp',
      content: 'AssetCore transformed how we manage our IT assets. The role-based access system is perfect for our multi-team organization.',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      role: 'Operations Manager',
      content: 'The real-time analytics saved us 20 hours per week in manual reporting. Highly recommend!',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Security Lead',
      content: 'Enterprise-grade security with user-friendly interface. Best of both worlds.',
      rating: 5
    }
  ];

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Navigation */}
      <Box bg="white" boxShadow="sm" py={4} position="sticky" top={0} zIndex={1000}>
        <Container maxW="container.2xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              <Image
                src="assetcore1.png"
                h="40px"
                objectFit="contain"
              />
            </HStack>
            
            {isMobile ? (
              <IconButton
                icon={<HamburgerIcon />}
                variant="ghost"
                onClick={onNavOpen}
                aria-label="Open Menu"
              />
            ) : (
              <HStack spacing={6}>
                <Link href="#features" fontWeight="medium" _hover={{ color: 'blue.500' }}>Features</Link>
                <Link href="#pricing" fontWeight="medium" _hover={{ color: 'blue.500' }}>Pricing</Link>
                <Link href="#faq" fontWeight="medium" _hover={{ color: 'blue.500' }}>FAQ</Link>
                <Link href="#contact" fontWeight="medium" _hover={{ color: 'blue.500' }}>Contact</Link>
                
                <Button
                  colorScheme="blue"
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    bg: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  onClick={onOpen}
                  size="md"
                >
                  Sign In
                </Button>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isNavOpen} placement="right" onClose={onNavClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={4}>
              <Link href="#features" onClick={onNavClose} fontSize="lg" fontWeight="medium">Features</Link>
              <Link href="#pricing" onClick={onNavClose} fontSize="lg" fontWeight="medium">Pricing</Link>
              <Link href="#faq" onClick={onNavClose} fontSize="lg" fontWeight="medium">FAQ</Link>
              <Link href="#contact" onClick={onNavClose} fontSize="lg" fontWeight="medium">Contact</Link>
              <Divider />
              <Button
                colorScheme="blue"
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                onClick={() => { onNavClose(); onOpen(); }}
                size="lg"
                w="full"
              >
                Sign In
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Hero Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={{ base: 12, md: 24 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 8, lg: 12 }} alignItems="center">
            <GridItem>
              <SlideFade in={true} offsetY={20}>
                <VStack align={{ base: 'center', lg: 'flex-start' }} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
                  <Badge 
                    colorScheme="whiteAlpha" 
                    px={4} 
                    py={1} 
                    rounded="full"
                    fontSize="sm"
                  >
                    Enterprise Ready
                  </Badge>
                  
                  <Heading size={{ base: '2xl', md: '3xl' }} lineHeight="1.2">
                    Manage Your Assets with 
                    <Text as="span" color="yellow.200"> Confidence</Text>
                  </Heading>
                  
                  <Text fontSize={{ base: 'md', md: 'xl' }} opacity={0.9}>
                    The complete asset management solution with enterprise security, 
                    real-time analytics, and role-based access control for organizations of all sizes.
                  </Text>
                  
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} pt={4} w={{ base: 'full', sm: 'auto' }}>
                    <Button
                      size="lg"
                      colorScheme="whiteAlpha"
                      rightIcon={<ChevronRightIcon />}
                      onClick={onOpen}
                      _hover={{ bg: 'whiteAlpha.300' }}
                      w={{ base: 'full', sm: 'auto' }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      color="white"
                      borderColor="white"
                      _hover={{ bg: 'whiteAlpha.200' }}
                      onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                      w={{ base: 'full', sm: 'auto' }}
                    >
                      Learn More
                    </Button>
                  </Stack>
                  
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 6, md: 8 }} pt={8} w="full">
                    {stats.map((stat, index) => (
                      <VStack key={index} align={{ base: 'center', lg: 'flex-start' }} spacing={1}>
                        <HStack>
                          <Icon as={stat.icon} />
                          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">{stat.value}</Text>
                        </HStack>
                        <Text fontSize="xs" opacity={0.8}>{stat.label}</Text>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </VStack>
              </SlideFade>
            </GridItem>
            
            <GridItem display={{ base: 'flex', lg: 'block' }} justifyContent="center">
              <ScaleFade in={true} initialScale={0.9}>
                <Card
                  justifyContent={"center"}
                  bg="whiteAlpha.200"
                  backdropFilter="blur(10px)"
                  borderWidth={1}
                  borderColor="whiteAlpha.300"
                  p={{ base: 6, md: 8 }}
                  rounded="2xl"
                  w={{ base: 'full', sm: '400px' }}
                  maxW="full"
                >
                  <VStack spacing={6} align="stretch">
                    <Text fontSize="md" color={"white"} opacity={0.9}>
                      <Icon as={CheckIcon} mr={2} color="white" />
                      Real-time asset tracking
                    </Text>
                    <Text fontSize="md" color={"white"} opacity={0.9}>
                      <Icon as={CheckIcon} mr={2} color="white" />
                      Role-based dashboard views
                    </Text>
                    <Text fontSize="md" color={"white"} opacity={0.9}>
                      <Icon as={CheckIcon} mr={2} color="white" />
                      Advanced security controls
                    </Text>
                  </VStack>
                </Card>
              </ScaleFade>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={16} align="center">
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Badge colorScheme="blue" px={4} py={1} rounded="full">FEATURES</Badge>
              <Heading size="2xl">Everything You Need in One Platform</Heading>
              <Text fontSize="xl" color="gray.600">
                From asset tracking to advanced analytics, AssetCore provides all the tools 
                you need for comprehensive asset management
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
              {features.map((feature, index) => (
                <Fade key={index} in={true} delay={index * 0.1}>
                  <Card 
                    variant="outline" 
                    borderWidth={1}
                    borderColor="gray.200"
                    _hover={{ 
                      transform: 'translateY(-4px)',
                      borderColor: 'blue.300',
                      boxShadow: 'xl'
                    }}
                    transition="all 0.3s"
                    h="full"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="flex-start">
                        <Flex
                          w={12}
                          h={12}
                          bg={`${feature.color}15`}
                          color={feature.color}
                          rounded="lg"
                          align="center"
                          justify="center"
                        >
                          <Icon as={feature.icon} boxSize={6} />
                        </Flex>
                        <Heading size="md">{feature.title}</Heading>
                        <Text color="gray.600">{feature.description}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Fade>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Role-Based Access Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
            <GridItem>
              <VStack spacing={6} align="flex-start">
                <Badge colorScheme="purple" px={4} py={1} rounded="full">ACCESS CONTROL</Badge>
                <Heading size="2xl">Role-Based Access Made Simple</Heading>
                <Text fontSize="lg" color="gray.600">
                  Define precise permissions for each user role. From Super Admin with 
                  full system control to Viewers with read-only access.
                </Text>
                
                <List spacing={4} pt={4}>
                  {[
                    'Organization Admin: Manage organization-wide assets',
                    'Unit Admin: Control specific business units',
                    'User: Daily operations and asset updates',
                    'Viewer: Read-only access for monitoring'
                  ].map((item, idx) => (
                    <ListItem key={idx}>
                      <ListIcon as={CheckIcon} color="green.500" />
                      {item}
                    </ListItem>
                  ))}
                </List>
                
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={onOpen}
                  mt={4}
                >
                  Experience Role-Based Access
                </Button>
              </VStack>
            </GridItem>
            
            <GridItem>
              <Card bg="white" boxShadow="2xl" rounded="2xl" overflow="hidden">
                <CardBody p={0}>
                  <VStack spacing={0} align="stretch">
                    {[
                      { role: 'Organization Admin', color: 'green', access: 'Org Management' },
                      { role: 'Unit Admin', color: 'blue', access: 'Unit Control' },
                      { role: 'User', color: 'purple', access: 'Operations' },
                      { role: 'Viewer', color: 'gray', access: 'Read Only' }
                    ].map((item, idx) => (
                      <Flex
                        key={idx}
                        p={6}
                        align="center"
                        justify="space-between"
                        borderBottom={idx < 4 ? '1px solid' : 'none'}
                        borderColor="gray.100"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <HStack spacing={4}>
                          <Flex
                            w={10}
                            h={10}
                            bg={`${item.color}.100`}
                            color={`${item.color}.700`}
                            rounded="full"
                            align="center"
                            justify="center"
                          >
                            <Icon as={FaUserCheck} />
                          </Flex>
                          <VStack align="flex-start" spacing={1}>
                            <Text fontWeight="bold">{item.role}</Text>
                            <Text fontSize="sm" color="gray.500">{item.access}</Text>
                          </VStack>
                        </HStack>
                        <ChevronRightIcon color="gray.400" />
                      </Flex>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={20} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Badge colorScheme="orange" px={4} py={1} rounded="full">TESTIMONIALS</Badge>
              <Heading size="2xl">Trusted by Industry Leaders</Heading>
              <Text fontSize="xl" color="gray.600">
                See what our customers have to say about their experience with AssetCore
              </Text>
            </VStack>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} variant="outline" borderWidth={1} borderColor="gray.200">
                  <CardBody p={6}>
                    <VStack spacing={4} align="flex-start">
                      <HStack spacing={2}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Icon key={i} as={StarIcon} color="yellow.400" />
                        ))}
                      </HStack>
                      <Text fontStyle="italic">"{testimonial.content}"</Text>
                      <Divider />
                      <VStack spacing={1} align="flex-start">
                        <Text fontWeight="bold">{testimonial.name}</Text>
                        <Text fontSize="sm" color="gray.500">{testimonial.role}</Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box id="faq" py={20} bg="gray.50">
        <Container maxW="container.lg">
          <VStack spacing={12} align="center">
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Badge colorScheme="green" px={4} py={1} rounded="full">FAQ</Badge>
              <Heading size="2xl">Frequently Asked Questions</Heading>
              <Text fontSize="xl" color="gray.600">
                Get answers to common questions about AssetCore
              </Text>
            </VStack>
            
            <Accordion allowToggle w="full" maxW="4xl">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} borderColor="gray.200">
                  <h2>
                    <AccordionButton py={4} _hover={{ bg: 'gray.100' }}>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} color="gray.600">
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
            
            <VStack spacing={4} pt={8}>
              <Text fontWeight="medium">Still have questions?</Text>
              <Button
                colorScheme="blue"
                variant="outline"
                rightIcon={<ExternalLinkIcon />}
                onClick={() => window.open('mailto:support@assetcore.com')}
              >
                Contact Support
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        py={16}
      >
        <Container maxW="container.lg">
          <VStack spacing={8} textAlign="center">
            <Heading size="2xl">Ready to Transform Your Asset Management?</Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              Join thousands of organizations who trust AssetCore for their asset management needs. 
              Start your free 14-day trial today.
            </Text>
            
            <HStack spacing={4} pt={4}>
              <Button
                size="sm"
                colorScheme="whiteAlpha"
                rightIcon={<ChevronRightIcon />}
                onClick={onOpen}
                _hover={{ bg: 'whiteAlpha.300' }}
              >
                Start Free Trial
              </Button>
              {/* <Button
                size="sm"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                Schedule Demo
              </Button> */}
            </HStack>
            
            <Text fontSize="sm" opacity={0.8}>
              No credit card required • Cancel anytime • Full support included
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" color="gray.400" py={12}>
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={8}>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <HStack spacing={4}>
                  <Image
                    src="assetcore1.png"
                    h="30px"
                    objectFit="contain"
                  />
                </HStack>
                <Text>
                  Enterprise asset management solution with advanced security 
                  and role-based access control for modern organizations.
                </Text>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Heading size="sm" color="white">Product</Heading>
                <Link href="#features" _hover={{ color: 'white' }}>Features</Link>
                <Link href="#pricing" _hover={{ color: 'white' }}>Pricing</Link>
                <Link href="#faq" _hover={{ color: 'white' }}>FAQ</Link>
                <Link href="#" _hover={{ color: 'white' }}>Documentation</Link>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Heading size="sm" color="white">Company</Heading>
                <Link href="#" _hover={{ color: 'white' }}>About Us</Link>
                <Link href="#" _hover={{ color: 'white' }}>Careers</Link>
                <Link href="#" _hover={{ color: 'white' }}>Blog</Link>
                <Link href="#" _hover={{ color: 'white' }}>Contact</Link>
              </VStack>
            </GridItem>
          </Grid>
          
          <Divider my={8} borderColor="gray.700" />
          
          <Flex justify="space-between" align="center" flexDir={{ base: 'column', md: 'row' }} gap={4}>
            <Text fontSize="sm">
              © {new Date().getFullYear()} AssetCore. All rights reserved.
            </Text>
            <HStack spacing={6}>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>Privacy Policy</Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>Terms of Service</Link>
              <Link href="#" fontSize="sm" _hover={{ color: 'white' }}>Cookie Policy</Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
  <LoginPage isOpen={isOpen} onClose={onClose} />

    </Box>
  );

};

export default LandingPage;