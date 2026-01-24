import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Flex,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useColorModeValue,
  Icon,
  HStack,
  VStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Progress,
  Stack,
  Tag,
  Divider,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiAlertTriangle,
  FiCalendar,
  FiTool,
  FiShield,
  FiAlertCircle,
  FiFileText,
  FiCheckCircle,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiSettings,
  FiActivity,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import { FiBarChart } from "react-icons/fi";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const toast = useToast();

  const [summaryData, setSummaryData] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const response = await api.get("/api/dashboard/summary/");
      setSummaryData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }

    try {
      const response = await api.get("api/alerts/priority-alerts/");
      setPriorityData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Dashboard cards data mapping
  const dashboardCards = summaryData
    ? [
        {
          id: 1,
          title: "Total Assets",
          value: summaryData.assets.total.toLocaleString(),
          change: "+0%", // Default if not in API
          isPositive: true,
          icon: FiPackage,
          color: "blue.500",
          description: "Active assets in system",
          trend: "up",
          path: "/assets",
        },
        {
          id: 2,
          title: "Out of Service",
          value: summaryData.assets.out_of_service,
          change: "",
          isPositive: false,
          icon: FiTool,
          color: "red.500",
          description: "Currently not operational",
          trend: "down",
          path: "/assets",
        },
        {
          id: 3,
          title: "PM Due",
          value: summaryData.assets.pm_due,
          change: "",
          isPositive: false,
          icon: FiCalendar,
          color: "orange.500",
          description: "Preventive maintenance pending",
          trend: "up",
          path: "/services",
        },
        {
          id: 4,
          title: "Calibration Due",
          value: summaryData.assets.calibration_due,
          change: "",
          isPositive: false,
          icon: FiAlertCircle,
          color: "yellow.500",
          description: "Requires calibration",
          trend: "up",
          path: "/services",
        },
        {
          id: 5,
          title: "Warranty Expired",
          value: summaryData.assets.warranty_expired,
          change: "",
          isPositive: false,
          icon: FiShield,
          color: "purple.500",
          description: "Warranty ended",
          trend: "warning",
          path: "/assets",
        },
        {
          id: 6,
          title: "Issues Open",
          value: summaryData.issues.open,
          change: "",
          isPositive: false,
          icon: FiAlertTriangle,
          color: "red.400",
          description: "Active issues",
          trend: "up",
          path: "/issue",
        },
        {
          id: 7,
          title: "AMC/CMC covered",
          value: summaryData.assets.amc_cmc_covered,
          change: "",
          isPositive: true,
          icon: FiCreditCard,
          color: "green.500",
          description: "Covered assets",
          trend: "up",
          path: "/assets",
        },
        {
          id: 8,
          title: "License Expired",
          value: summaryData.assets.license_expired,
          change: "",
          isPositive: false,
          icon: FiFileText,
          color: "teal.500",
          description: "Expired licenses",
          trend: "stable",
          path: "/assets",
        },
        {
          id: 9,
          title: "Issues Closed",
          value: summaryData.issues.closed,
          change: "",
          isPositive: true,
          icon: FiCheckCircle,
          color: "green.400",
          description: "Resolved issues",
          trend: "up",
          path: "/issue",
        },
      ]
    : [];

  // Priority alerts data
  const priorityAlerts = priorityData ? priorityData.alerts : [];
  const priorityCount = priorityData ? priorityData.count : 0;
  const assetStatus = [
  {
    status: "Operational",
    count: summaryData
      ? summaryData.assets.total - (summaryData.assets.out_of_service || 0)
      : 0,
    percentage: summaryData?.assets?.total > 0
      ? Math.round(
          ((summaryData.assets.total - (summaryData.assets.out_of_service || 0)) /
            summaryData.assets.total) *
            100,
        )
      : 0,
    color: "green",
  },
  {
    status: "Out of Service",
    count: summaryData ? (summaryData.assets.out_of_service || 0) : 0,
    percentage: summaryData?.assets?.total > 0
      ? Math.round(
          ((summaryData.assets.out_of_service || 0) / summaryData.assets.total) *
            100,
        )
      : 0,
    color: "red",
  },
];
  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      p={{ base: 4, md: 6 }}
      pt={{ base: 0, md: 6 }}
    >
      {/* Dashboard Header */}
      <Box mb={6}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
        >
          <Box mb={{ base: 4, md: 0 }}>
            <HStack >
              <Text fontWeight={"bold"} color={"blue.700"} fontSize={"2xl"}>Welcome Back,</Text> <Text fontWeight={"bold"} color={"green"} fontSize={"2xl"}>{user.first_name}</Text>
            </HStack>
            <Text color={textColor} fontSize={{ base: "xs", lg: "sm" }}>
              Comprehensive overview of assets and maintenance activities
            </Text>
          </Box>
          <HStack spacing={4}>
            <Badge colorScheme="green" p={2} borderRadius="md">
              <HStack>
                <Icon as={FiClock} />
                <Text fontSize={{base:"10px",md:"15px"}}>
                  Updated : {new Date().toLocaleString()}
                </Text>
              </HStack>
            </Badge>
            <Badge colorScheme="blue" p={2} borderRadius="md">
              <HStack>
                <Icon as={FiUsers} />
                <HStack>
                <Text fontSize={{base:"10px",md:"15px"}}>Active Users: {summaryData.users.active}</Text>
                </HStack>
              </HStack>
            </Badge>
          </HStack>
        </Flex>
      </Box>

      {/* Main Dashboard Cards Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
        {/* Left side - Main Dashboard Cards (2/3 width) */}
        <Box>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {dashboardCards.map((card) => (
              <Card
                key={card.id}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                transition="all 0.3s"
                cursor="pointer"
                onClick={() => navigate(card.path)}
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "lg",
                  borderColor: card.color,
                }}
              >
                <CardBody>
                  <Flex justify="space-between" align="start" mb={4}>
                    <Box flex="1">
                      <Text
                        color={textColor}
                        fontSize="sm"
                        fontWeight="medium"
                        mb={1}
                      >
                        {card.title}
                      </Text>
                      <Heading size="lg" mb={2} color={headingColor}>
                        {card.value}
                      </Heading>
                      <HStack spacing={2} mb={2}>
                        {card.trend === "up" ? (
                          <Icon
                            as={FiTrendingUp}
                            color={card.isPositive ? "green.500" : "red.500"}
                          />
                        ) : card.trend === "down" ? (
                          <Icon as={FiTrendingDown} color="red.500" />
                        ) : null}
                        <Text
                          fontSize="sm"
                          color={card.isPositive ? "green.500" : "red.500"}
                        >
                          {card.change}
                        </Text>
                      </HStack>
                    </Box>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg={`${card.color}15`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={card.icon} w={6} h={6} color={card.color} />
                    </Box>
                  </Flex>
                  <Text fontSize="sm" color={textColor}>
                    {card.description}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* Right side - Alerts and Analytics (1/3 width) */}
        <VStack spacing={4} align="stretch">
          {/* Asset Status Breakdown */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardBody>
              <Heading size="md" mb={4} color={headingColor}>
                📊 Asset Status
              </Heading>
              <VStack spacing={4} align="stretch">
                {assetStatus.map((status, index) => (
                  <Box key={index}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" color={textColor}>
                        {status.status}
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={headingColor}
                      >
                        {status.count} ({status.percentage}%)
                      </Text>
                    </Flex>
                    <Progress
                      value={status.percentage}
                      size="sm"
                      colorScheme={status.color}
                      borderRadius="full"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
          {/* Priority Alerts Section */}
          <Card
            bg={cardBg}
            h={"350px"}
            overflowY={"auto"}
            border="1px"
            borderColor={borderColor}
          >
            <CardHeader
              position="sticky"
              top={0}
              zIndex={1}
              bg={cardBg}
              borderBottom="1px"
              borderColor={borderColor}
              py={3}
            >
              <Flex justify="space-between" align="center">
                <Heading size="md" color={headingColor}>
                  🔔 Priority Alerts
                </Heading>
                <Badge
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  px={3}
                >
                  {priorityCount} Alerts
                </Badge>
              </Flex>
            </CardHeader>

            <CardBody>
              {priorityCount > 0 ? (
                <VStack spacing={4} align="stretch">
                  {priorityAlerts.map((alert) => (
                    <Box
                      key={alert.id}
                      p={4}
                      borderRadius="md"
                      border="1px"
                      borderColor={borderColor}
                      bg={useColorModeValue("gray.50", "gray.900")}
                    >
                      <Flex justify="space-between" align="center" mb={2}>
                        <Heading size="sm" color={headingColor}>
                          {alert.asset_name}
                        </Heading>
                        <HStack>
                          <Badge
                            colorScheme={
                              alert.status === "open" ? "red" : "orange"
                            }
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                          >
                            {alert.status.toUpperCase()}
                          </Badge>
                          <Tag size="sm" colorScheme="red" variant="subtle">
                            Due in {
                              Math.ceil((new Date() - new Date(alert.created_at)) / (1000 * 60 * 60 * 24))
                            } day{
                              Math.ceil((new Date() - new Date(alert.created_at)) / (1000 * 60 * 60 * 24)) > 1 ? "s" : ""
                            }
                          </Tag>


                          <Badge
                            colorScheme={
                              alert.priority === "high" ? "red" : "orange"
                            }
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                          >
                            {alert.priority.toUpperCase()}
                          </Badge>
                        </HStack>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color={textColor}>
                            {alert.alert_type}
                          </Text>
                        </VStack>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color={textColor}>
                            {alert.message}
                          </Text>
                        </VStack>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box
                  p={8}
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                  bg={useColorModeValue("gray.50", "gray.900")}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minH="200px"
                >
                  <VStack spacing={3}>
                    <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                    <Text color={textColor} fontSize="md" textAlign="center">
                      No priority alerts at the moment
                    </Text>
                    <Text color={textColor} fontSize="sm" textAlign="center">
                      All assets are functioning well!
                    </Text>
                  </VStack>
                </Box>
              )}
            </CardBody>

            <CardFooter
              borderTop="1px"
              borderColor={borderColor}
              py={2}
              bg={cardBg}
              position="sticky"
              bottom={0}
              zIndex={1}
            >
              <Flex justify="space-between" align="center" w="full">
                <Text fontSize="xs" color={textColor} opacity={0.7}>
                  Showing {priorityAlerts.length} priority alerts
                </Text>
                <Button size="xs" variant="ghost" colorScheme="blue">
                  View All →
                </Button>
              </Flex>
            </CardFooter>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Dashboard;
