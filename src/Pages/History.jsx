import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Icon,
  Text,
  Divider,
  useColorModeValue,
  Flex,
  Badge,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import {
  FiCheckCircle,
  FiCalendar,
  FiPackage,
  FiShield,
  FiActivity,
  FiFilter,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiUser,
  FiAlertCircle,
  FiClock,
  FiDollarSign,
  FiTool,
  FiTrendingUp,
  FiEye,
  FiEdit,
  FiTrash2,
  FiChevronDown,
} from 'react-icons/fi'
import {
  MdMedicalServices,
  MdDevices,
  MdHistoryEdu,
  MdSecurity,
  MdAssignmentTurnedIn,
} from 'react-icons/md'
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'

const History = () => {
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')
  const subtleBg = useColorModeValue('gray.100', 'gray.700')
  const primaryColor = useColorModeValue('blue.600', 'blue.400')
  const successColor = useColorModeValue('green.600', 'green.400')
  const warningColor = useColorModeValue('orange.600', 'orange.400')
  const errorColor = useColorModeValue('red.600', 'red.400')

  // State
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalActivities: 0,
    completedTasks: 0,
    pendingActions: 0,
    assetUpdates: 0,
    trend: 12.5, // percentage increase
  })

  // Activity categories
  const activityCategories = [
    { id: 'all', label: 'All Activities', icon: FiActivity, color: primaryColor },
    { id: 'maintenance', label: 'Maintenance', icon: FiTool, color: 'orange.500' },
    { id: 'updates', label: 'Asset Updates', icon: FiPackage, color: 'green.500' },
    { id: 'security', label: 'Security', icon: FiShield, color: 'purple.500' },
    { id: 'compliance', label: 'Compliance', icon: FiCheckCircle, color: 'blue.500' },
    { id: 'financial', label: 'Financial', icon: FiDollarSign, color: 'teal.500' },
  ]

  // Timeframe options
  const timeframeOptions = [
    { value: '24hours', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]

  // Enhanced sample data
  const [activities, setActivities] = useState([
    {
      id: 1,
      activity: 'CT Scanner - Calibration Completed',
      description: 'Quarterly calibration completed with 99.8% accuracy',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      icon: FiCheckCircle,
      category: 'maintenance',
      severity: 'low',
      assetId: 'AST-CT-001',
      assetName: 'CT Scanner',
      performedBy: 'Dr. Sarah Johnson',
      department: 'Radiology',
      tags: ['Calibration', 'Quality Check', 'Quarterly'],
      status: 'completed',
      priority: 'medium',
    },
    {
      id: 2,
      activity: 'MRI Machine - Preventive Maintenance Scheduled',
      description: 'Annual PM scheduled for December 15, 2024',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: FiCalendar,
      category: 'maintenance',
      severity: 'medium',
      assetId: 'AST-MRI-001',
      assetName: 'MRI Machine 3T',
      performedBy: 'System Auto',
      department: 'Imaging',
      tags: ['Preventive', 'Scheduled', 'Annual'],
      status: 'scheduled',
      priority: 'high',
    },
    {
      id: 3,
      activity: '15 New Assets Added to Inventory',
      description: 'New medical equipment received and registered',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      icon: FiPackage,
      category: 'updates',
      severity: 'low',
      assetId: 'BATCH-001',
      assetName: 'Multiple Assets',
      performedBy: 'Inventory Manager',
      department: 'Procurement',
      tags: ['New Assets', 'Inventory', 'Procurement'],
      status: 'completed',
      priority: 'medium',
    },
    {
      id: 4,
      activity: '3 Equipment Warranties Renewed',
      description: 'Extended warranties for critical care equipment',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: FiShield,
      category: 'financial',
      severity: 'medium',
      assetId: 'WRN-001',
      assetName: 'Multiple Equipment',
      performedBy: 'Finance Dept',
      department: 'Finance',
      tags: ['Warranty', 'Renewal', 'Financial'],
      status: 'completed',
      priority: 'high',
    },
    {
      id: 5,
      activity: 'Quarterly Asset Audit Completed',
      description: 'Full system audit with 98.7% accuracy rate',
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      icon: FiActivity,
      category: 'compliance',
      severity: 'low',
      assetId: 'AUD-001',
      assetName: 'System Wide',
      performedBy: 'Audit Team',
      department: 'Compliance',
      tags: ['Audit', 'Compliance', 'Quarterly'],
      status: 'completed',
      priority: 'medium',
    },
    {
      id: 6,
      activity: 'Ultrasound Machine - Repair Completed',
      description: 'Replaced transducer and recalibrated system',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      icon: FiTool,
      category: 'maintenance',
      severity: 'high',
      assetId: 'AST-US-003',
      assetName: 'Ultrasound GE',
      performedBy: 'John Technician',
      department: 'Biomedical',
      tags: ['Repair', 'Urgent', 'Hardware'],
      status: 'completed',
      priority: 'high',
    },
    {
      id: 7,
      activity: 'Security Access Logs Reviewed',
      description: 'Monthly security audit of asset access logs',
      time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      icon: MdSecurity,
      category: 'security',
      severity: 'medium',
      assetId: 'SEC-001',
      assetName: 'Security System',
      performedBy: 'Security Admin',
      department: 'Security',
      tags: ['Security', 'Audit', 'Access Logs'],
      status: 'completed',
      priority: 'medium',
    },
  ])

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      activity.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.assetId.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Calculate stats
  useEffect(() => {
    const calculateStats = () => {
      const total = filteredActivities.length
      const completed = filteredActivities.filter(a => a.status === 'completed').length
      const pending = filteredActivities.filter(a => a.status === 'scheduled' || a.status === 'pending').length
      const updates = filteredActivities.filter(a => a.category === 'updates').length
      
      setStats({
        totalActivities: total,
        completedTasks: completed,
        pendingActions: pending,
        assetUpdates: updates,
        trend: 12.5,
      })
    }
    
    calculateStats()
  }, [filteredActivities])

  // Format time
  const formatTime = (isoString) => {
    const date = parseISO(isoString)
    const now = new Date()
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffHours < 168) {
      const days = Math.floor(diffHours / 24)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return format(date, 'MMM dd, yyyy HH:mm')
    }
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return errorColor
      case 'medium': return warningColor
      case 'low': return successColor
      default: return textColor
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'green'
      case 'scheduled': return 'blue'
      case 'pending': return 'orange'
      case 'failed': return 'red'
      default: return 'gray'
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // In real app, you would fetch new data here
    }, 1000)
  }

  return (
    <Box minH="100vh" bg={bgColor} p={{ base: 4, md: 6 }} pt={{ base: 0, md: 6 }}>
      {/* Header Section */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" color={headingColor} mb={2}>
            Activity History
          </Heading>
          <Text color={textColor}>
            Track and monitor all system activities, maintenance logs, and asset updates
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiRefreshCw />}
            variant="outline"
            onClick={handleRefresh}
            isLoading={isLoading}
            size="sm"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            variant="outline"
            size="sm"
          >
            Export Logs
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Total Activities</StatLabel>
              <StatNumber color={headingColor}>{stats.totalActivities}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {stats.trend}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Completed Tasks</StatLabel>
              <StatNumber color="green.500">{stats.completedTasks}</StatNumber>
              <StatHelpText>
                {stats.totalActivities > 0 
                  ? `${Math.round((stats.completedTasks / stats.totalActivities) * 100)}% success rate`
                  : 'No data'
                }
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Pending Actions</StatLabel>
              <StatNumber color="orange.500">{stats.pendingActions}</StatNumber>
              <StatHelpText>Requires attention</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Asset Updates</StatLabel>
              <StatNumber color="blue.500">{stats.assetUpdates}</StatNumber>
              <StatHelpText>This period</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel color={textColor}>Avg. Response Time</StatLabel>
              <StatNumber color="purple.500">4.2h</StatNumber>
              <StatHelpText>↓ 18% from last week</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Filters and Controls */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="center">
            <InputGroup flex="1" maxW={{ md: '300px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search activities, assets, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <HStack spacing={3} flexWrap="wrap">
              <Select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                size="sm"
                maxW="200px"
              >
                {timeframeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Menu>
                <MenuButton as={Button} rightIcon={<FiChevronDown />} size="sm" variant="outline">
                  <HStack>
                    <Icon as={FiFilter} />
                    <Text>{activityCategories.find(c => c.id === selectedCategory)?.label || 'Category'}</Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  {activityCategories.map(category => (
                    <MenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      icon={<Icon as={category.icon} color={category.color} />}
                    >
                      {category.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>

              <Button size="sm" variant="ghost" leftIcon={<FiAlertCircle />}>
                Critical Only
              </Button>
            </HStack>
          </Flex>

          {/* Quick Filter Chips */}
          <HStack spacing={2} mt={4} flexWrap="wrap">
            {activityCategories.map(category => (
              <Button
                key={category.id}
                size="xs"
                variant={selectedCategory === category.id ? "solid" : "outline"}
                colorScheme={selectedCategory === category.id ? "blue" : "gray"}
                leftIcon={<Icon as={category.icon} />}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </HStack>
        </CardBody>
      </Card>

      {/* Main Content */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Activity List */}
        <Box gridColumn={{ base: 1, lg: 'span 2' }}>
          <Card bg={cardBg} border="1px" borderColor={borderColor} h="890px" overflowY={"auto"}>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md" color={headingColor}>
                  Recent Activities
                </Heading>
                <Badge colorScheme="blue">
                  {filteredActivities.length} records
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Center h="200px">
                  <Spinner size="xl" />
                </Center>
              ) : filteredActivities.length === 0 ? (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle>No activities found</AlertTitle>
                  <AlertDescription>
                    Try adjusting your filters or search criteria
                  </AlertDescription>
                </Alert>
              ) : (
                <VStack spacing={3} align="stretch">
                  {filteredActivities.map((activity) => (
                    <Box
                      key={activity.id}
                      p={4}
                      borderRadius="lg"
                      border="1px"
                      borderColor={borderColor}
                      bg={cardBg}
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'md',
                        borderColor: primaryColor,
                      }}
                    >
                      <Flex justify="space-between" align="start" mb={2}>
                        <HStack spacing={3}>
                          <Icon 
                            as={activity.icon} 
                            color={activityCategories.find(c => c.id === activity.category)?.color || primaryColor}
                            boxSize={5}
                          />
                          <Box>
                            <Text fontWeight="semibold" color={headingColor}>
                              {activity.activity}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {activity.description}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge 
                          colorScheme={getStatusColor(activity.status)}
                          variant="subtle"
                        >
                          {activity.status}
                        </Badge>
                      </Flex>

                      <Flex justify="space-between" align="center" mt={3}>
                        <HStack spacing={4}>
                          <Tooltip label="Asset">
                            <Badge variant="outline" colorScheme="blue">
                              <HStack spacing={1}>
                                <MdDevices />
                                <Text>{activity.assetId}</Text>
                              </HStack>
                            </Badge>
                          </Tooltip>
                          
                          <Tooltip label="Priority">
                            <Badge 
                              variant="subtle" 
                              colorScheme={
                                activity.priority === 'high' ? 'red' :
                                activity.priority === 'medium' ? 'orange' : 'blue'
                              }
                            >
                              {activity.priority}
                            </Badge>
                          </Tooltip>

                          <Tooltip label="Department">
                            <Badge variant="outline">
                              {activity.department}
                            </Badge>
                          </Tooltip>
                        </HStack>

                        <HStack spacing={3}>
                          <Tooltip label="Performed by">
                            <HStack spacing={1}>
                              <Icon as={FiUser} color={textColor} boxSize={3} />
                              <Text fontSize="xs" color={textColor}>
                                {activity.performedBy}
                              </Text>
                            </HStack>
                          </Tooltip>
                          
                          <Tooltip label="Time">
                            <HStack spacing={1}>
                              <Icon as={FiClock} color={textColor} boxSize={3} />
                              <Text fontSize="xs" color={textColor}>
                                {formatTime(activity.time)}
                              </Text>
                            </HStack>
                          </Tooltip>
                        </HStack>
                      </Flex>

                      {/* Tags */}
                      <HStack spacing={2} mt={3} flexWrap="wrap">
                        {activity.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="subtle"
                            colorScheme="gray"
                            fontSize="2xs"
                            px={2}
                            py={1}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack>

                      {/* Action Buttons */}
                      <Flex justify="flex-end" gap={2} mt={4}>
                        <Button size="xs" leftIcon={<FiEye />} variant="ghost">
                          View Details
                        </Button>
                        <Button size="xs" leftIcon={<FiEdit />} variant="ghost">
                          Edit
                        </Button>
                        <Button 
                          size="xs" 
                          leftIcon={<FiTrash2 />} 
                          variant="ghost" 
                          colorScheme="red"
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* Sidebar - Summary and Insights */}
        <Box>
          <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
            <CardHeader>
              <Heading size="md" color={headingColor}>
                📊 Activity Insights
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color={textColor} mb={2}>
                    Activity Distribution
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {activityCategories.slice(1).map(category => {
                      const count = filteredActivities.filter(a => a.category === category.id).length
                      const percentage = filteredActivities.length > 0 
                        ? Math.round((count / filteredActivities.length) * 100) 
                        : 0
                      
                      return (
                        <Box key={category.id}>
                          <Flex justify="space-between" mb={1}>
                            <HStack spacing={2}>
                              <Icon as={category.icon} color={category.color} boxSize={3} />
                              <Text fontSize="sm">{category.label}</Text>
                            </HStack>
                            <Text fontSize="sm" fontWeight="semibold">
                              {count} ({percentage}%)
                            </Text>
                          </Flex>
                          <Progress 
                            value={percentage} 
                            colorScheme={category.color.split('.')[0]} 
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      )
                    })}
                  </VStack>
                </Box>

                <Divider borderColor={borderColor} />

                <Box>
                  <Text fontSize="sm" color={textColor} mb={3}>
                    Top Performing Departments
                  </Text>
                  <VStack spacing={3} align="stretch">
                    {['Radiology', 'Biomedical', 'Maintenance', 'Procurement'].map(dept => (
                      <HStack key={dept} justify="space-between">
                        <Text fontSize="sm">{dept}</Text>
                        <Badge colorScheme="green">
                          <HStack spacing={1}>
                            <FiTrendingUp />
                            <Text>98%</Text>
                          </HStack>
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Recent Users */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color={headingColor}>
                👥 Recent Users
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <AvatarGroup size="sm" max={4}>
                    <Avatar name="Dr. Sarah Johnson" />
                    <Avatar name="John Technician" />
                    <Avatar name="Audit Team" />
                    <Avatar name="System Auto" />
                    <Avatar name="Finance Dept" />
                  </AvatarGroup>
                  <Text fontSize="sm" color={textColor}>
                    12 active users today
                  </Text>
                </HStack>
                
                <Divider borderColor={borderColor} />
                
                <Box>
                  <Text fontSize="sm" color={textColor} mb={2}>
                    Most Active Today
                  </Text>
                  {[
                    { name: 'Dr. Sarah Johnson', actions: 15, role: 'Radiologist' },
                    { name: 'John Technician', actions: 12, role: 'Biomedical Engineer' },
                    { name: 'System Auto', actions: 8, role: 'Automated System' },
                  ].map((user, index) => (
                    <HStack key={index} justify="space-between" mb={2}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">{user.name}</Text>
                        <Text fontSize="xs" color={textColor}>{user.role}</Text>
                      </Box>
                      <Badge colorScheme="blue">{user.actions} actions</Badge>
                    </HStack>
                  ))}
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default History