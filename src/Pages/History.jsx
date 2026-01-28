import React, { useState, useEffect, useMemo } from 'react'
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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
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
import { format, parseISO } from 'date-fns'
import api from '../services/api'

const History = () => {
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')
  const primaryColor = useColorModeValue('blue.600', 'blue.400')

  // State
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState([])

  // Calculate recent users from activities
  const recentUsers = useMemo(() => {
    if (!activities?.results) return []
    
    const userActionCounts = {}
    
    activities.results.forEach(activity => {
      if (activity.actor_name) {
        if (!userActionCounts[activity.actor_name]) {
          userActionCounts[activity.actor_name] = {
            name: activity.actor_name,
            count: 0,
            role: activity.actor_role || 'User',
            department: activity.department || 'General',
            lastActivity: activity.created_at
          }
        }
        userActionCounts[activity.actor_name].count++
        
        if (activity.created_at > userActionCounts[activity.actor_name].lastActivity) {
          userActionCounts[activity.actor_name].lastActivity = activity.created_at
        }
      }
    })
    
    return Object.values(userActionCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [activities])

  // Calculate active users today
  const activeUsersToday = useMemo(() => {
    if (!activities?.results) return 0
    
    const today = new Date().toISOString().split('T')[0]
    const uniqueUsersToday = new Set()
    
    activities.results.forEach(activity => {
      if (activity.actor_name && activity.created_at) {
        const activityDate = activity.created_at.split('T')[0]
        if (activityDate === today) {
          uniqueUsersToday.add(activity.actor_name)
        }
      }
    })
    
    return uniqueUsersToday.size
  }, [activities])

  // Calculate activity type distribution
  const activityTypeDistribution = useMemo(() => {
    if (!activities?.results) return []
    
    const typeCounts = {}
    
    activities.results.forEach(activity => {
      const type = activity.action_type || 'unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / activities.results.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
  }, [activities])

  // Calculate department distribution
  const departmentDistribution = useMemo(() => {
    if (!activities?.results) return []
    
    const deptCounts = {}
    
    activities.results.forEach(activity => {
      const dept = activity.department || 'Unknown Department'
      deptCounts[dept] = (deptCounts[dept] || 0) + 1
    })
    
    return Object.entries(deptCounts)
      .map(([dept, count]) => ({
        dept,
        count,
        percentage: Math.round((count / activities.results.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 departments
  }, [activities])

  // Activity categories
  const activityCategories = [
    { id: 'all', label: 'All Activities', icon: FiActivity, color: primaryColor },
    { id: 'maintenance', label: 'Maintenance', icon: FiTool, color: 'orange.500' },
    { id: 'updates', label: 'Asset Updates', icon: FiPackage, color: 'green.500' },
    { id: 'security', label: 'Security', icon: FiShield, color: 'purple.500' },
    { id: 'compliance', label: 'Compliance', icon: FiCheckCircle, color: 'blue.500' },
    { id: 'financial', label: 'Financial', icon: FiDollarSign, color: 'teal.500' },
    { id: 'asset_created', label: 'Asset Created', icon: FiPackage, color: 'green.500' },
    { id: 'issue_assigned', label: 'Issue Assigned', icon: MdAssignmentTurnedIn, color: 'blue.500' },
  ]

  // Timeframe options
  const timeframeOptions = [
    { value: '24hours', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ]

  // Fetch activities
  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/api/activity_logs/')
      setActivities(response.data)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  // Filter activities
  const filteredActivities = activities?.results?.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.action_type === selectedCategory
    const matchesSearch = searchQuery === '' || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.actor_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  }) || []

  // Format time
  const formatTime = (isoString) => {
    if (!isoString) return ''
    try {
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
    } catch (e) {
      return isoString
    }
  }

  // Get severity color
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'red.500'
      case 'medium': return 'orange.500'
      case 'low': return 'green.500'
      default: return textColor
    }
  }

  // Get status color
  const getStatusColor = (status, actionType) => {
    if (status) {
      switch(status) {
        case 'completed': return 'green'
        case 'scheduled': return 'blue'
        case 'pending': return 'orange'
        case 'failed': return 'red'
        default: return 'gray'
      }
    }
    
    // Fallback to action_type
    switch(actionType) {
      case 'asset_created': return 'green'
      case 'issue_assigned': return 'blue'
      default: return 'gray'
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities()
  }

  // Get icon for activity type
  const getActivityIcon = (type) => {
    const category = activityCategories.find(c => c.id === type)
    return category ? category.icon : FiActivity
  }

  // Get color for activity type
  const getActivityColor = (type) => {
    const category = activityCategories.find(c => c.id === type)
    return category ? category.color : primaryColor
  }

  return (
    <Box minH="100vh" bg={bgColor} p={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
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
                            as={activityCategories.find(c => c.id === activity.action_type)?.icon || FiActivity} 
                            color={activityCategories.find(c => c.id === activity.action_type)?.color || primaryColor}
                            boxSize={5}
                          />
                          <Box>
                            <Text fontWeight="semibold" color={headingColor}>
                              {activity.title}
                            </Text>
                            <Text fontSize="sm" color={textColor}>
                              {activity.description}
                            </Text>
                          </Box>
                        </HStack>
                        <Badge 
                          colorScheme={getStatusColor(activity.status, activity.action_type)}
                          variant="subtle"
                        >
                          {activity.status || activity.action_type.replace('_', ' ')}
                        </Badge>
                      </Flex>

                      <Flex justify="space-between" align="center" mt={3}>
                        <HStack spacing={4}>
                          <Tooltip label="Asset">
                            <Badge variant="outline" colorScheme="blue">
                              <HStack spacing={1}>
                                <MdDevices />
                                <Text>{activity.asset_id}</Text>
                              </HStack>
                            </Badge>
                          </Tooltip>
                          
                          {activity.priority && (
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
                          )}

                          {activity.department && (
                            <Tooltip label="Department">
                              <Badge variant="outline">
                                {activity.department}
                              </Badge>
                            </Tooltip>
                          )}
                        </HStack>

                        <HStack spacing={3}>
                          <Tooltip label="Performed by">
                            <HStack spacing={1}>
                              <Icon as={FiUser} color={textColor} boxSize={3} />
                              <Text fontSize="xs" color={textColor}>
                                {activity.actor_name}
                              </Text>
                            </HStack>
                          </Tooltip>
                          
                          <Tooltip label="Time">
                            <HStack spacing={1}>
                              <Icon as={FiClock} color={textColor} boxSize={3} />
                              <Text fontSize="xs" color={textColor}>
                                {formatTime(activity.created_at)}
                              </Text>
                            </HStack>
                          </Tooltip>
                        </HStack>
                      </Flex>

                      {/* Tags */}
                      {activity.tags && activity.tags.length > 0 && (
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
                      )}

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

        {/* Sidebar - Analytics Cards */}
        <Box>
          {/* Activity Type Distribution */}
          <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
            <CardHeader>
              <Heading size="md" color={headingColor}>
                📊 Activity Types
              </Heading>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Center h="100px">
                  <Spinner size="sm" />
                </Center>
              ) : activityTypeDistribution.length === 0 ? (
                <Text fontSize="sm" color={textColor} textAlign="center">
                  No activity data available
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {activityTypeDistribution.slice(0, 5).map((item, index) => (
                    <Box key={index}>
                      <Flex justify="space-between" mb={1}>
                        <HStack spacing={2}>
                          <Icon 
                            as={getActivityIcon(item.type)} 
                            color={getActivityColor(item.type)} 
                            boxSize={3} 
                          />
                          <Text fontSize="sm" textTransform="capitalize">
                            {item.type.replace('_', ' ')}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="semibold">
                          {item.count} ({item.percentage}%)
                        </Text>
                      </Flex>
                      <Progress 
                        value={item.percentage} 
                        colorScheme={getActivityColor(item.type).split('.')[0]} 
                        size="sm"
                        borderRadius="full"
                      />
                    </Box>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>

          {/* Department Distribution */}
          <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
            <CardHeader>
              <Heading size="md" color={headingColor}>
                🏢 Department Activity
              </Heading>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Center h="100px">
                  <Spinner size="sm" />
                </Center>
              ) : departmentDistribution.length === 0 ? (
                <Text fontSize="sm" color={textColor} textAlign="center">
                  No department data available
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {departmentDistribution.map((dept, index) => (
                    <Box key={index}>
                      <Flex justify="space-between" mb={1}>
                        <HStack spacing={2}>
                          <Icon as={FiUser} color="blue.500" boxSize={3} />
                          <Text fontSize="sm">
                            {dept.dept}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" fontWeight="semibold">
                          {dept.count} ({dept.percentage}%)
                        </Text>
                      </Flex>
                      <Progress 
                        value={dept.percentage} 
                        colorScheme="blue"
                        size="sm"
                        borderRadius="full"
                      />
                    </Box>
                  ))}
                </VStack>
              )}
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
                <HStack spacing={3} justify="space-between">
                  <AvatarGroup size="sm" max={4}>
                    {recentUsers.slice(0, 4).map((user, index) => (
                      <Avatar 
                        key={index} 
                        name={user.name}
                        src={user.avatar}
                        title={`${user.name} (${user.count} actions)`}
                      />
                    ))}
                    {recentUsers.length > 4 && (
                      <Avatar name={`+${recentUsers.length - 4} more`} />
                    )}
                  </AvatarGroup>
                  <Text fontSize="sm" color={textColor}>
                    {activeUsersToday} active users today
                  </Text>
                </HStack>
                
                <Divider borderColor={borderColor} />
                
                <Box>
                  <Text fontSize="sm" color={textColor} mb={2}>
                    Most Active Users
                  </Text>
                  {recentUsers.length > 0 ? (
                    recentUsers.map((user, index) => (
                      <HStack key={index} justify="space-between" mb={2}>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">{user.name}</Text>
                          <Text fontSize="xs" color={textColor}>
                            {user.department || user.role}
                          </Text>
                        </Box>
                        <Badge colorScheme="blue">
                          {user.count} action{user.count !== 1 ? 's' : ''}
                        </Badge>
                      </HStack>
                    ))
                  ) : (
                    <Text fontSize="sm" color={textColor} textAlign="center" py={2}>
                      No user activity data available
                    </Text>
                  )}
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