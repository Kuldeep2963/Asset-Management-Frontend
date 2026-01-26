import React, { useState, useEffect } from "react";
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
  FormHelperText,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Avatar,
  AvatarGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  DrawerCloseButton,
  StatGroup,
  StatArrow,
  SimpleGrid,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Tooltip,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  InputGroup,
  InputLeftElement,
  Switch,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Collapse,
  useToast,
  Spinner,
  Spacer,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiTrash2,
  FiChevronUp,
  FiUpload,
  FiEye,
  FiMessageSquare,
  FiPaperclip,
  FiCalendar,
  FiBarChart2,
  FiChevronDown,
  FiChevronRight,
  FiUsers,
  FiTool,
  FiSend,
  FiBell,
  FiStar,
} from "react-icons/fi";
import {
  MdPriorityHigh,
  MdOutlineAssignment,
  MdOutlineDeviceHub,
  MdOutlineLocationOn,
  MdAccessTime,
  MdOutlineCheckCircleOutline,
} from "react-icons/md";
import { format, addDays, subDays } from "date-fns";
import { FaBarcode, FaQrcode, FaSearch } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Html5QrcodeScanner } from "html5-qrcode";
import { formatDistanceToNow } from "date-fns";
import CommentModal from "../Components/modals/CommentModal";

import { useSearchParams } from 'react-router-dom';

const Issue = () => {
  const { user } = useAuth();
  const toast = useToast();

  

  const [searchParams] = useSearchParams();
  const q_asset_name = searchParams.get('asset_name');

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const primaryColor = useColorModeValue("blue.600", "blue.400");
  const successColor = useColorModeValue("green.500", "green.400");
  const warningColor = useColorModeValue("orange.500", "orange.400");
  const errorColor = useColorModeValue("red.500", "red.400");
  const subtleBg = useColorModeValue("gray.100", "gray.700");
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Add these to your component state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // You can make this configurable
  const [isLoadingAssignableUsers, setIsLoadingAssignableUsers] =
    useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const userRole = user?.role || "";
  const canRaiseIssue = userRole === "viewer"; 
  const can_comment_and_can_assign = ["unit_admin", "org_admin"].includes(
    userRole,
  );
  // alert(canRaiseIssue);
  // Modal and drawer states
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isAssignOpen,
    onOpen: onAssignOpen,
    onClose: onAssignClose,
  } = useDisclosure();
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isScannerOpen,
    onOpen: onScannerOpen,
    onClose: onScannerClose,
  } = useDisclosure();
  const {
    isOpen: isCommentOpen,
    onOpen: onCommentOpen,
    onClose: onCommentClose,
  } = useDisclosure();

  // State
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState(q_asset_name || "");

  useEffect(() => {
    if (q_asset_name) {
      setSearchQuery(q_asset_name);
    }
  }, [q_asset_name]);

  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueForComment, setSelectedIssueForComment] = useState(null);

  const handleOpenCommentModal = (issue) => {
    setSelectedIssueForComment(issue);
    onCommentOpen();
  };

  const handleExportData = async () => {
    try {
      const response = await api.get("/api/issues/export/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Issues-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: "Error exporting data",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  };

  const [filter, setFilter] = useState({
    priority: "all",
    status: "all",
    dateRange: "7days",
  });

  // Add state for issue form
  const [issueForm, setIssueForm] = useState({
    asset_id: "",
    asset_name: "",
    asset_type: "",
    title: "",
    description: "",
    priority: "medium",
    category: "",
    location: "",
    department: "",
    reportedBy: "",
    attachments: [],
  });

  const [assetIssues, setAssetIssues] = useState([]);

  const handleModalClose = () => {
    setIssueForm({
      asset_id: "",
      asset_name: "",
      asset_type: "",
      title: "",
      description: "",
      priority: "medium",
      category: "",
      location: "",
      department: "",
      reportedBy: "",
      attachments: [],
    });
    setAssetIssues([]);
    onCreateClose();
  };
  // Function to fetch assignable users
  const fetchAssignableUsers = async () => {
    try {
      setIsLoadingAssignableUsers(true);
      const response = await api.get("/api/users/assignable/");
      const data = response.data.results || response.data || [];
      setAssignableUsers(data);
    } catch (error) {
      console.error("Error fetching assignable users:", error);
      toast({
        title: "Error Loading Users",
        description: error.response?.data?.detail || "Could not load assignable users. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setAssignableUsers([]);
    } finally {
      setIsLoadingAssignableUsers(false);
    }
  };
  // Function to fetch asset details
  const fetchAssetDetails = async (asset_asset_id) => {
    try {
      const response = await api.get(
        `/api/assets/basic-with-issues/?asset_id=${asset_asset_id}`,
      );
      const assetData = response.data.results || response.data || [];
      console.log("Fetched asset data:", assetData);

      if (Array.isArray(assetData) && assetData.length > 0) {
        const asset = assetData[0];

        setIssueForm((prev) => ({
          ...prev,
          asset_id: asset.id || "",
          asset_asset_id: asset.asset_id || "",
          asset_name: asset.asset_name || "",
          asset_type: asset.asset_type || "",
          category: asset.category || "",
          location: asset.location || asset.unit_name || "",
          department: asset.department || asset.department_name || "",
        }));

        setAssetIssues(asset.issues || []);

        toast({
          title: "Asset found",
          description: `Loaded details for ${asset.asset_name}`,
          status: "success",
          duration: 2000,
        });
      } else {
        throw new Error("Asset not found");
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
      toast({
        title: "Asset not found",
        description: "Please check the asset ID and try again",
        status: "error",
        duration: 3000,
      });

      setIssueForm((prev) => ({
        ...prev,
        asset_id: "",
        asset_name: "",
        asset_type: "",
        category: "",
        location: "",
        department: "",
      }));
      setAssetIssues([]);
    }
  };
  // Install: npm install html5-qrcode

  const handleScan = () => {
    onScannerOpen();
  };

  useEffect(() => {
    let scanner = null;

    if (isScannerOpen) {
      setTimeout(() => {
        scanner = new Html5QrcodeScanner(
          "scanner-container",
          {
            qrbox: {
              width: 250,
              height: 250,
            },
            fps: 5,
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          /* verbose= */ false,
        );

        scanner.render(
          (decodedText) => {
            setIssueForm((prev) => ({ ...prev, asset_id: decodedText }));
            fetchAssetDetails(decodedText);
            scanner.clear();
            onScannerClose();
          },
          (error) => {
            console.log("QR Code scan error:", error);
          },
        );
      }, 100);
    }

    return () => {
      if (scanner) {
        scanner
          .clear()
          .catch((err) => console.log("Error clearing scanner:", err));
      }
    };
  }, [isScannerOpen]);

  // Assignment form state
  // const [assignmentForm, setAssignmentForm] = useState({
  //   assignee: "",
  //   team: "",
  //   deadline: "",
  //   estimatedHours: "",
  //   notes: "",
  // });

  // Sample data
  const fetchIssues = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/issues/");
      const data = response.data.results || response.data || [];
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast({
        title: "Error Loading Issues",
        description:
          error.response?.data?.detail ||
          "Could not load issues. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Technician",
      role: "Biomedical Engineer",
      department: "Engineering",
      avatar: "JT",
    },
    {
      id: 2,
      name: "Sarah Engineer",
      role: "Lead Technician",
      department: "Maintenance",
      avatar: "SE",
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      role: "IT Specialist",
      department: "IT",
      avatar: "MR",
    },
    {
      id: 4,
      name: "Emily Chen",
      role: "Systems Analyst",
      department: "Operations",
      avatar: "EC",
    },
    {
      id: 5,
      name: "David Wilson",
      role: "Field Engineer",
      department: "Engineering",
      avatar: "DW",
    },
  ]);

  const [teams, setTeams] = useState([
    { id: 1, name: "Biomedical Team", members: 5, lead: "John Technician" },
    { id: 2, name: "IT Support Team", members: 8, lead: "Mike Rodriguez" },
    { id: 3, name: "Maintenance Crew", members: 12, lead: "Sarah Engineer" },
    { id: 4, name: "Emergency Response", members: 6, lead: "David Wilson" },
  ]);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: "0",
    slaCompliance: "0%",
  });

  // Filtered issues
  // const filteredIssues = issues.filter((issue) => {
  //   const matchesTab =
  //     activeTab === "all" ||
  //     (activeTab === "open" && issue.status === "open") ||
  //     (activeTab === "in-progress" && issue.status === "in-progress") ||
  //     (activeTab === "assigned" && issue.status === "assigned") ||
  //     (activeTab === "resolved" && issue.status === "resolved") ||
  //     (activeTab === "pending" && issue.status === "pending") ||
  //     (activeTab === "closed" && issue.status === "closed");

  //   const matchesSearch =
  //     searchQuery === "" ||
  //     issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     issue.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     issue.reportedBy.toLowerCase().includes(searchQuery.toLowerCase());

  //   const matchesPriority =
  //     filter.priority === "all" || issue.priority === filter.priority;
  //   const matchesStatus =
  //     filter.status === "all" || issue.status === filter.status;

  //   return matchesTab && matchesSearch && matchesPriority && matchesStatus;
  // });
  const filteredIssues = issues.filter((issue) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "open" && issue.status === "open") ||
      (activeTab === "in_progress" && issue.status === "in_progress") ||
      (activeTab === "assigned" && issue.assigned_to !== null) ||
      (activeTab === "resolved" && issue.status === "resolved") ||
      (activeTab === "closed" && issue.status === "closed") ||
      (activeTab === "pending" && issue.status === "pending");

    const matchesSearch =
      searchQuery === "" ||
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.asset_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.created_by_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      filter.priority === "all" || issue.priority === filter.priority;
    const matchesStatus =
      filter.status === "all" || issue.status === filter.status;

    return matchesTab && matchesSearch && matchesPriority && matchesStatus;
  });

  // Calculate stats
  // useEffect(() => {
  //   const total = issues.length;
  //   const open = issues.filter((i) => i.status === "open").length;
  //   const inProgress = issues.filter((i) => i.status === "in-progress").length;
  //   const resolved = issues.filter(
  //     (i) => i.status === "resolved" || i.status === "closed"
  //   ).length;
  //   const slaCompliance = Math.round((resolved / total) * 100) || 0;

  //   setStats({
  //     total,
  //     open,
  //     inProgress,
  //     resolved,
  //     avgResolutionTime: "2.5",
  //     slaCompliance: `${slaCompliance}%`,
  //   });
  // }, [issues]);
  useEffect(() => {
    const total = issues.length;
    const open = issues.filter((i) => i.status === "open").length;
    const inProgress = issues.filter((i) => i.status === "in_progress").length;
    const resolved = issues.filter(
      (i) => i.status === "resolved",
    ).length;
    const closed = issues.filter(
      (i) => i.status === "closed",
    ).length;
    const assigned = issues.filter(
      (i) => i.assigned_to !== null && i.assigned_to !== undefined,
    ).length;
    const slaCompliance = total > 0 ? Math.round((resolved / total) * 100) : 0;

    setStats({
      total,
      open,
      inProgress,
      resolved,
      assigned,
      closed,
      avgResolutionTime: "2.5",
      slaCompliance: `${slaCompliance}%`,
    });
  }, [issues]);

  // Handlers
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("title", issueForm.title);
      formData.append("description", issueForm.description);
      formData.append("asset", issueForm.asset_id);
      formData.append("priority", issueForm.priority);
      formData.append("reported_date", format(new Date(), "yyyy-MM-dd"));
      // formData.append("assigned_to", null);
      // formData.append(
      //   "estimated_resolution",
      //   format(addDays(new Date(), 3), "yyyy-MM-dd")
      // );
      formData.append("actual_resolution", "");
      formData.append("tags", JSON.stringify([issueForm.category]));
      // formData.append("last_updated", format(new Date(), "yyyy-MM-dd"));

      if (issueForm.attachments && issueForm.attachments.length > 0) {
        issueForm.attachments.forEach((file) => {
          formData.append("images_files", file);
        });
      }

      const response = await api.post("/api/issues/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdIssue = response.data;
      setIssues([createdIssue, ...issues]);
      setIssueForm({
        asset_id: "",
        asset_name: "",
        asset_type: "",
        title: "",
        description: "",
        priority: "medium",
        category: "",
        location: "",
        department: "",
        reportedBy: "",
        attachments: [],
      });

      toast({
        title: "Issue Created",
        description: `Issue ${createdIssue.title} has been created successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      handleModalClose();
    } catch (error) {
      console.error("Error creating issue:", error);
      toast({
        title: "Error Creating Issue",
        description: "There was an error creating the issue. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [assignmentForm, setAssignmentForm] = useState({
    assigned_to: "",
    status: "assigned",
    deadline: "",
    estimatedHours: "",
    notes: "",
  });

  // Update handleAssignIssue function
  const handleAssignIssue = async () => {
    if (!assignmentForm.assigned_to) {
      toast({
        title: "Assignee Required",
        description: "Please select a user to assign this issue to",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAssigning(true);

    try {
      const issueIds = selectedIssue ? [selectedIssue.id] : selectedIssues;

      // Process all selected issues
      const promises = issueIds.map(async (issueId) => {
        // Prepare payload according to API documentation
        console.log(assignmentForm)
        const payload = {
          assigned_to_id: assignmentForm.assigned_to,
          status: assignmentForm.status,
          ...(assignmentForm.deadline && {
            estimated_resolution: assignmentForm.deadline,
          }),
        };

        console.log("Assigning issue payload:", payload);

        const response = await api.patch(
          `/api/issues/${issueId}/assign/`,
          payload,
        );

        return response.data;
      });

      const updatedIssues = await Promise.all(promises);
      console.log("Updated issues from API:", updatedIssues);

      // Update local state with the response
      const newIssues = issues.map((issue) => {
        const updatedIssue = updatedIssues.find((u) => u.id === issue.id);
        if (updatedIssue) {
          // Find the assigned user's details
          const assignedUser = assignableUsers.find(
            (u) => u.id === assignmentForm.assigned_to,
          );

          return {
            ...issue,
            assigned_to: updatedIssue.assigned_to,
            assigned_to_name: assignedUser
              ? `${assignedUser.name} `
              : "Unknown User",
            assigned_to_email: assignedUser?.email || "",
            status: updatedIssue.status,
            last_updated: updatedIssue.last_updated || new Date().toISOString(),
            ...(assignmentForm.deadline && {
              estimated_resolution: assignmentForm.deadline,
            }),
          };
        }
        return issue;
      });

      setIssues(newIssues);

      // Add comment if notes are provided
      if (assignmentForm.notes.trim()) {
        await addAssignmentComment(issueIds, assignmentForm.notes);
      }

      toast({
        title: "Issue Assigned",
        description: `${issueIds.length} issue(s) assigned successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset form and close modal
      setAssignmentForm({
        assigned_to: "",
        status: "assigned",
        deadline: "",
        // estimatedHours: "",
        notes: "",
      });

      setSelectedIssues([]);
      onAssignClose();
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast({
        title: "Assignment Failed",
        description:
          error.message ||
          "There was an error assigning the issue. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Helper function to add comment
  const addAssignmentComment = async (issueIds, comment) => {
    try {
      const promises = issueIds.map(async (issueId) => {
        const response = await api.post(`/api/issues/${issueId}/comments/`, {
          text: `Assignment Note: ${comment}`,
          user_id: user?.id || "system",
        });

        return response.data;
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error adding assignment comment:", error);
      // Don't fail the whole assignment if comment fails
    }
  };

  // Function to handle opening assignment modal
  const handleOpenAssignModal = (issue) => {
    setSelectedIssue(issue);

    // Pre-populate form with existing assignment if any
    setAssignmentForm({
      assigned_to: issue.assigned_to || "",
      status: issue.status || "assigned",
      deadline: issue.estimated_resolution || "",
      // estimatedHours: "",
      notes: "",
    });

    // Fetch assignable users when modal opens
    fetchAssignableUsers();
    onAssignOpen();
  };

  // Helper function to get user display name by ID
  const getUserDisplayName = (userId) => {
    const user = assignableUsers.find((u) => u.id === userId);
    if (user) {
      return `${user.first_name} ${user.last_name}`;
    }
    return "Unknown User";
  };

  const handleDeleteIssue = async (issueId) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await api.delete(`/api/issues/${issueId}/`);
        setIssues(issues.filter((issue) => issue.id !== issueId));
        toast({
          title: "Issue Deleted",
          description: "The issue has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error deleting issue:", error);
        toast({
          title: "Delete Failed",
          description:
            error.response?.data?.detail ||
            "Could not delete issue. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  

  // Update your table button to use this new function
  const handleIssueSelect = (issueId) => {
    if (selectedIssues.includes(issueId)) {
      setSelectedIssues(selectedIssues.filter((id) => id !== issueId));
    } else {
      setSelectedIssues([...selectedIssues, issueId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIssues.length === filteredIssues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(filteredIssues.map((issue) => issue.id));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "red";
      case "in_progress":
        return "blue";
      case "assigned":
        return "purple";
      case "resolved":
        return "green";
      case "pending":
        return "orange";
      case "closed":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return FiAlertTriangle;
      case "in_progress":
        return FiClock;
      case "assigned":
        return MdOutlineAssignment;
      case "resolved":
        return FiCheckCircle;
      case "pending":
        return FiClock;
      case "closed":
        return MdOutlineCheckCircleOutline;
      default:
        return FiAlertTriangle;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  // const getTimeAgo = (dateString) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

  //   if (diffHours < 1) return "Just now";
  //   if (diffHours < 24) return `${diffHours}h ago`;
  //   return format(date, "MMM dd");
  // };
  const getTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`;
      }
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;

      return format(date, "MMM dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  const handleCommentAdded = (newComment) => {
    fetchIssues();
    // Update selectedIssue if it's the one we're commenting on
    if (selectedIssue && selectedIssue.id === selectedIssueForComment?.id) {
      const updatedComments = [...(selectedIssue.comments || []), newComment];
      setSelectedIssue({ ...selectedIssue, comments: updatedComments });
    }
  };

  const handleAddComment = async (issueId, text) => {
    if (!text.trim()) return;

    try {
      const formData = new FormData();
      formData.append("description", text.trim());

      const response = await api.post(
        `/api/issues/${issueId}/comments/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Comment added",
          status: "success",
          duration: 2000,
        });
        fetchIssues();

        // Update selectedIssue if it's the one we're commenting on
        if (selectedIssue && selectedIssue.id === issueId) {
          const updatedComments = [
            ...(selectedIssue.comments || []),
            response.data,
          ];
          setSelectedIssue({ ...selectedIssue, comments: updatedComments });
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error adding comment",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      mb={{ base: 8, md: 0 }}
      bg={bgColor}
      py={{ base: 4, md: 8 }}
      pt={{ base: 4, md: 8 }}
      px={{ base: 4, md: 8 }}
    >
      <CommentModal
        isOpen={isCommentOpen}
        onClose={onCommentClose}
        issueId={selectedIssueForComment?.id}
        onCommentAdded={handleCommentAdded}
      />
      {/* <Container maxW="8xl"> */}
      {/* Header Section */}
        <Box mb={6}>
        <Flex justify="space-between" align={"center"} mb={{base:2,md:"0"}} >
          <Heading
              size={{ base: "md", md: "lg" }}
              color={headingColor}
              mb={2}
            >
              Issue Management
            </Heading>
            
            {canRaiseIssue && (
            <Button
              w={{base:"150px", md:"auto"}}
              leftIcon={<FiPlus />}
              colorScheme="blue"
              size="sm"
              onClick={onCreateOpen}
            >
              Raise Issue
            </Button>
            
          )}
          
        </Flex>
        <Text fontSize={{ base: "xs", md: "md" }} color={textColor}>
              Track, assign, and resolve asset-related issues efficiently
            </Text>
         </Box>
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3} mb={6}>
  {/* Total Issues */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          Total Issues
        </StatLabel>
        <StatNumber color="blue.500" fontSize="lg">
          {stats.total}
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        <StatArrow type="increase" />
        12% this month
      </StatHelpText>
    </Stat>
  </Box>

  {/* Open Issues */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          Open Issues
        </StatLabel>
        <StatNumber color="red.500" fontSize="lg">
          {stats.open}
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        Requiring attention
      </StatHelpText>
    </Stat>
  </Box>

  {/* In Progress */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          In Progress
        </StatLabel>
        <StatNumber color="orange.500" fontSize="lg">
          {stats.inProgress}
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        Being resolved
      </StatHelpText>
    </Stat>
  </Box>

  {/* Resolved */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          Resolved
        </StatLabel>
        <StatNumber color="green.500" fontSize="lg">
          {stats.resolved}
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        This month
      </StatHelpText>
    </Stat>
  </Box>

  {/* Avg. Resolution Time */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          Avg. Resolution Time
        </StatLabel>
        <StatNumber color="purple.500" fontSize="lg">
          {stats.avgResolutionTime}d
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        ↓ 0.5 days from last month
      </StatHelpText>
    </Stat>
  </Box>

  {/* SLA Compliance */}
  <Box
    bg={cardBg}
    border="1px"
    borderColor={borderColor}
    p={3}
    borderRadius="md"
  >
    <Stat>
      <Grid templateColumns="1fr auto" gap={2} alignItems="center">
        <StatLabel color={textColor} fontSize="sm">
          SLA Compliance
        </StatLabel>
        <StatNumber color="teal.500" fontSize="lg">
          {stats.slaCompliance}
        </StatNumber>
      </Grid>
      <StatHelpText mt={1} fontSize="xs">
        Within target
      </StatHelpText>
    </Stat>
  </Box>
</SimpleGrid>

      {/* Main Content */}
      <Box>
        {/* Filters Section - Row for Desktop, Column for Mobile */}
        <Box 
          bg={cardBg} 
          p={4} 
          borderRadius="lg" 
          border="1px" 
          borderColor={borderColor} 
          mb={6}
          boxShadow="sm"
        >
          <Flex direction="column" gap={4}>
            <Flex justify="space-between" align="center">
              <Heading size="sm" color={headingColor}>
                <Flex align="center" gap={2}>
                  <Icon as={FiFilter} />
                  Filters & Actions
                </Flex>
              </Heading>
              
              <Box display={{ base: "block", lg: "none" }}>
                <Button
                  size="sm"
                  leftIcon={<FiFilter />}
                  variant="ghost"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  {isFilterOpen ? "Hide" : "Show"}
                </Button>
              </Box>
            </Flex>

            <Collapse in={isFilterOpen || !isMobile} animateOpacity>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} alignItems="flex-end">
                {/* Search */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" mb={1}>Search Issues</FormLabel>
                  <InputGroup bg={"white"} size="sm">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="ID, title, asset..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderRadius="md"
                    />
                  </InputGroup>
                </FormControl>

                {/* Priority Filter */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" mb={1}>Priority</FormLabel>
                  <Select
                    bg={"white"}
                    size="sm"
                    value={filter.priority}
                    onChange={(e) =>
                      setFilter({ ...filter, priority: e.target.value })
                    }
                    borderRadius="md"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </FormControl>

                {/* Status Filter */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" mb={1}>Status</FormLabel>
                  <Select
                    bg={"white"}
                    size="sm"
                    value={filter.status}
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                    borderRadius="md"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </Select>
                </FormControl>

                {/* Date Range */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="bold" mb={1}>Date Range</FormLabel>
                  <Select
                    bg={"white"}
                    size="sm"
                    value={filter.dateRange}
                    onChange={(e) =>
                      setFilter({ ...filter, dateRange: e.target.value })
                    }
                    borderRadius="md"
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                    <option value="year">This year</option>
                    <option value="custom">Custom range</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              {/* Quick Actions Row */}
              <Flex 
                mt={4} 
                pt={4} 
                borderTop="1px" 
                borderColor={borderColor}
                justify="flex-end"
                gap={2}
                flexWrap="wrap"
              >
                <Button
                  colorScheme="blue"
                  leftIcon={<FiDownload />}
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                >
                  Export
                </Button>
                <Button
                  colorScheme="red"
                  leftIcon={<FiBell />}
                  variant="outline"
                  size="sm"
                >
                  Alerts
                </Button>
                {selectedIssues.length > 0 && (
                  <Button
                    leftIcon={<MdOutlineAssignment />}
                    colorScheme="blue"
                    size="sm"
                    onClick={onAssignOpen}
                  >
                    Assign Selected ({selectedIssues.length})
                  </Button>
                )}
              </Flex>
            </Collapse>
          </Flex>
        </Box>

        {/* Main Content Area */}
        <Box mb={4}>
            <Tabs
              colorScheme="blue"
              variant="line"
              onChange={(index) =>
                setActiveTab(
                  [
                    "all",
                    "open",
                    "in_progress",
                    "assigned",
                    "pending",
                    "resolved",
                    "closed",
                  ][index],
                )
              }
            >
              <TabList
                maxW={{ base: "350px", md: "90%" }}
                gap={{ base: 0, md: 8 }}
                mb={4}
                overflowX="auto"
                sx={{
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Text>All</Text>
                    <Badge borderRadius={"full"} colorScheme="gray">
                      {issues.length}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={FiAlertTriangle} color="red.500" />
                    <Text display={{ base: "none", md: "block" }}>Open</Text>
                    <Badge borderRadius={"full"} colorScheme="red">
                      {stats.open}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="blue.500" />
                    <Text display={{ base: "none", md: "block" }}>
                      In Progress
                    </Text>
                    <Badge borderRadius={"full"} colorScheme="blue">
                      {stats.inProgress}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={MdOutlineAssignment} color="purple.500" />
                    <Text display={{ base: "none", md: "block" }}>
                      Assigned
                    </Text>
                    <Badge borderRadius={"full"} colorScheme="purple">
                      {issues.filter((i) => i.status === "assigned").length}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="orange.500" />
                    <Text display={{ base: "none", md: "block" }}>Pending</Text>
                    <Badge borderRadius={"full"} colorScheme="orange">
                      {stats.pending}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={FiCheckCircle} color="green.500" />
                    <Text display={{ base: "none", md: "block" }}>
                      Resolved
                    </Text>
                    <Badge borderRadius={"full"} colorScheme="green">
                      {stats.resolved}
                    </Badge>
                  </HStack>
                </Tab>
                <Tab minWidth="fit-content">
                  <HStack spacing={2}>
                    <Icon as={FiXCircle} color="gray.500" />
                    <Text display={{ base: "none", md: "block" }}>Closed</Text>
                    <Badge borderRadius={"full"} colorScheme="gray">
                      {stats.closed}
                    </Badge>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {[
                  "all",
                  "open",
                  "in_progress",
                  "assigned",
                  "pending",
                  "resolved",
                  "closed",
                ].map((tab) => (
                  <TabPanel key={tab} p={0}>
                    {/* Issues Table */}
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardBody p={{ base: 2, md: 4 }}>
                        {filteredIssues.filter(
                          (issue) => tab === "all" || issue.status === tab,
                        ).length === 0 ? (
                          <Alert status="info" borderRadius="md">
                            <AlertIcon />
                            <Box>
                              <AlertTitle>No issues found</AlertTitle>
                              <AlertDescription>
                                {tab === "all"
                                  ? "Try adjusting your filters or search criteria"
                                  : `No ${tab} issues found with current filters`}
                              </AlertDescription>
                            </Box>
                          </Alert>
                        ) : (
                          <>
                            {/* Mobile Card View */}
                            <SimpleGrid
                              columns={{ base: 1, md: 2 }}
                              spacing={4}
                              display={{ base: "grid", lg: "none" }}
                            >
                              {filteredIssues
                                .filter(
                                  (issue) =>
                                    tab === "all" || issue.status === tab,
                                )
                                .slice(
                                  (currentPage - 1) * pageSize,
                                  currentPage * pageSize,
                                )
                                .map((issue) => (
                                  <Card
                                    key={issue.id}
                                    variant="outline"
                                    cursor="pointer"
                                    onClick={() => {
                                      setSelectedIssue(issue);
                                      onDetailOpen();
                                    }}
                                  >
                                    <CardBody>
                                      <Flex justify="space-between" mb={3}>
                                        <VStack align="start" spacing={0}>
                                          <Text
                                            fontWeight="bold"
                                            color={primaryColor}
                                            fontSize="sm"
                                          >
                                            {issue.id
                                              .substring(0, 9)
                                              .toUpperCase()}
                                          </Text>
                                          <Text
                                            fontWeight="semibold"
                                            noOfLines={1}
                                          >
                                            {issue.title}
                                          </Text>
                                        </VStack>
                                        <Checkbox
                                          isChecked={selectedIssues.includes(
                                            issue.id,
                                          )}
                                          onChange={() =>
                                            handleIssueSelect(issue.id)
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </Flex>

                                      <SimpleGrid
                                        columns={2}
                                        spacing={3}
                                        mb={3}
                                      >
                                        <Box>
                                          <Text fontSize="xs" color={textColor}>
                                            Priority
                                          </Text>
                                          <Badge
                                            colorScheme={getPriorityColor(
                                              issue.priority,
                                            )}
                                            size="sm"
                                          >
                                            {issue.priority?.toUpperCase() ||
                                              "MEDIUM"}
                                          </Badge>
                                        </Box>
                                        <Box>
                                          <Text fontSize="xs" color={textColor}>
                                            Status
                                          </Text>
                                          <Badge
                                            colorScheme={getStatusColor(
                                              issue.status,
                                            )}
                                            size="sm"
                                          >
                                            {issue.status}
                                          </Badge>
                                        </Box>
                                        <Box>
                                          <Text fontSize="xs" color={textColor}>
                                            Asset
                                          </Text>
                                          <Text fontSize="sm">
                                            {issue.asset_name}
                                          </Text>
                                        </Box>
                                        <Box>
                                          <Text fontSize="xs" color={textColor}>
                                            Reported Date
                                          </Text>
                                          <Text fontSize="sm">
                                            {format(
                                              new Date(issue.reported_date),
                                              "MMM dd, yyyy",
                                            )}
                                          </Text>
                                        </Box>
                                      </SimpleGrid>

                                      {issue.assigned_to && (
                                        <Flex align="center" gap={2} mb={3}>
                                          <Avatar
                                            size="xs"
                                            name={getUserDisplayName(
                                              issue.assigned_to.name,
                                            )}
                                          />
                                          <Text fontSize="sm">
                                            
                                              {issue.assigned_to.name}
                                           
                                          </Text>
                                        </Flex>
                                      )}

                                      <Flex justify="space-between">
                                        <HStack spacing={2}>
                                          {!canRaiseIssue && (
                                            <Tooltip label="Assign">
                                              <Button
                                                leftIcon={
                                                  <MdOutlineAssignment />
                                                }
                                                size="xs"
                                                variant="outline"
                                                colorScheme="green"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenAssignModal(issue);
                                                }}
                                              >
                                                Assign
                                              </Button>
                                            </Tooltip>
                                          )}

                                          <Tooltip label="View Details">
                                            <Button
                                              leftIcon={<FiEye />}
                                              size="xs"
                                              variant="outline"
                                              colorScheme="blue"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedIssue(issue);
                                                onDetailOpen();
                                              }}
                                            >
                                              View Details
                                            </Button>
                                          </Tooltip>
                                          {can_comment_and_can_assign && (
                                            <Tooltip label="Delete">
                                              <Button
                                                leftIcon={<FiTrash2 />}
                                                size="xs"
                                                variant="outline"
                                                colorScheme="red"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteIssue(issue.id);
                                                }}
                                              >
                                                Delete
                                              </Button>
                                            </Tooltip>
                                          )}
                                        </HStack>
                                        <Text fontSize="xs" color={textColor}>
                                          {formatDistanceToNow(
                                            new Date(issue.reported_date),
                                            { addSuffix: true },
                                          )}
                                        </Text>
                                      </Flex>
                                    </CardBody>
                                  </Card>
                                ))}
                            </SimpleGrid>

                            {/* Desktop Table View */}
                            {/* <TableContainer
                              display={{ base: "none", lg: "block" }}
                            > */}
                            <Box>
                              <Table
                                variant="simple"
                                size="sm"
                                display={{ base: "none", lg: "table" }}
                              >
                                <Thead h={"30px"} bg={"gray.100"}>
                                  <Tr>
                                    <Th color={"gray.800"} width="30px">
                                      <Checkbox
                                        isChecked={
                                          selectedIssues.length ===
                                            filteredIssues.filter(
                                              (issue) =>
                                                tab === "all" ||
                                                issue.status === tab,
                                            ).length &&
                                          filteredIssues.filter(
                                            (issue) =>
                                              tab === "all" ||
                                              issue.status === tab,
                                          ).length > 0
                                        }
                                        isIndeterminate={
                                          selectedIssues.length > 0 &&
                                          selectedIssues.length <
                                            filteredIssues.filter(
                                              (issue) =>
                                                tab === "all" ||
                                                issue.status === tab,
                                            ).length
                                        }
                                        onChange={handleSelectAll}
                                        aria-label="Select all issues"
                                      />
                                    </Th>
                                    <Th color={"gray.800"} width="100px">
                                      Issue ID
                                    </Th>
                                    <Th color={"gray.800"} minWidth="180px">
                                      Title
                                    </Th>
                                    <Th color={"gray.800"} width="120px">
                                      Asset
                                    </Th>
                                    <Th color={"gray.800"} width="90px">
                                      Priority
                                    </Th>
                                    <Th color={"gray.800"} width="100px">
                                      Status
                                    </Th>
                                    <Th color={"gray.800"} width="140px">
                                      Assigned To
                                    </Th>
                                    <Th color={"gray.800"} width="120px">
                                      Reported
                                    </Th>
                                    <Th
                                      textAlign={"center"}
                                      color={"gray.800"}
                                      width="80px"
                                    >
                                      Actions
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {filteredIssues
                                    .filter(
                                      (issue) =>
                                        tab === "all" || issue.status === tab,
                                    )
                                    .slice(
                                      (currentPage - 1) * pageSize,
                                      currentPage * pageSize,
                                    )
                                    .map((issue) => (
                                      <Tr
                                        key={issue.id}
                                        _hover={{ bg: subtleBg }}
                                        cursor="pointer"
                                        onClick={() => {
                                          setSelectedIssue(issue);
                                          onDetailOpen();
                                        }}
                                      >
                                        <Td
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Checkbox
                                            isChecked={selectedIssues.includes(
                                              issue.id,
                                            )}
                                            onChange={() =>
                                              handleIssueSelect(issue.id)
                                            }
                                            aria-label={`Select issue ${issue.id}`}
                                          />
                                        </Td>
                                        <Td>
                                          <Text
                                            fontWeight="semibold"
                                            color={primaryColor}
                                            fontSize="sm"
                                          >
                                            {issue.id
                                              .substring(0, 8)
                                              .toUpperCase()}
                                          </Text>
                                        </Td>
                                        <Td>
                                          <VStack align="start" spacing={0}>
                                            <Text
                                              fontWeight="medium"
                                              noOfLines={1}
                                              fontSize="sm"
                                            >
                                              {issue.title}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color={textColor}
                                              noOfLines={1}
                                            >
                                              {issue.description}
                                            </Text>
                                          </VStack>
                                        </Td>
                                        <Td>
                                          <VStack align="start" spacing={0}>
                                            <Text
                                              fontWeight="medium"
                                              fontSize="sm"
                                              noOfLines={1}
                                            >
                                              {issue.asset_name}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color={textColor}
                                            >
                                              {issue.asset_type}
                                            </Text>
                                          </VStack>
                                        </Td>
                                        <Td>
                                          <Badge
                                            colorScheme={getPriorityColor(
                                              issue.priority,
                                            )}
                                            size="sm"
                                          >
                                            {issue.priority?.toUpperCase() ||
                                              "MEDIUM"}
                                          </Badge>
                                        </Td>
                                        <Td>
                                          <Badge
                                            colorScheme={getStatusColor(
                                              issue.status,
                                            )}
                                            variant="subtle"
                                            size="sm"
                                            leftIcon={
                                              <Icon
                                                as={getStatusIcon(issue.status)}
                                                fontSize="xs"
                                              />
                                            }
                                          >
                                            {issue.status}
                                          </Badge>
                                        </Td>
                                        <Td>
                                          {issue.assigned_to ? (
                                            <HStack>
                                              <Avatar
                                                size="xs"
                                                name={getUserDisplayName(
                                                  issue.assigned_to.name,     ////////changed
                                                )}
                                              />
                                              <VStack align="start" spacing={0}>
                                                <Text
                                                  fontSize="sm"
                                                  fontWeight="medium"
                                                  noOfLines={1}
                                                >
                                                  {issue.assigned_to.name}
                                                </Text>
                                                {issue.assigned_to_email && (
                                                  <Text
                                                    fontSize="xs"
                                                    color={textColor}
                                                    noOfLines={1}
                                                  >
                                                    {issue.assigned_to_email}
                                                  </Text>
                                                )}
                                              </VStack>
                                            </HStack>
                                          ) : (
                                            <Text
                                              color={textColor}
                                              fontSize="sm"
                                            >
                                              Unassigned
                                            </Text>
                                          )}
                                        </Td>
                                        <Td>
                                          <VStack align="start" spacing={0}>
                                            <Text fontSize="sm">
                                              {format(
                                                new Date(issue.reported_date),
                                                "MMM dd",
                                              )}
                                            </Text>
                                            <Text
                                              fontSize="xs"
                                              color={textColor}
                                            >
                                              {formatDistanceToNow(
                                                new Date(issue.reported_date),
                                                { addSuffix: true },
                                              )}
                                            </Text>
                                          </VStack>
                                        </Td>
                                        <Td
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <HStack spacing={1}>
                                            {(can_comment_and_can_assign ||
                                              (issue.assigned_to === null &&
                                                userRole ===
                                                  "service_user")) && (
                                              <Tooltip
                                                bg={"white"}
                                                color={"black"}
                                                label="Assign"
                                              >
                                                <IconButton
                                                  aria-label="Assign issue"
                                                  icon={<MdOutlineAssignment />}
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() =>
                                                    handleOpenAssignModal(issue)
                                                  }
                                                />
                                              </Tooltip>
                                            )}
                                            <Tooltip
                                              bg={"white"}
                                              color={"black"}
                                              style={"italic"}
                                              label="View Details"
                                            >
                                              <IconButton
                                                aria-label="View details"
                                                icon={<FiEye />}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                  setSelectedIssue(issue);
                                                  onDetailOpen();
                                                }}
                                              />
                                            </Tooltip>
                                            {can_comment_and_can_assign && (
                                              <Tooltip
                                                bg={"white"}
                                                color={"red.500"}
                                                label="Delete Issue"
                                              >
                                                <IconButton
                                                  aria-label="Delete issue"
                                                  icon={<FiTrash2 />}
                                                  size="sm"
                                                  variant="ghost"
                                                  colorScheme="red"
                                                  onClick={() =>
                                                    handleDeleteIssue(issue.id)
                                                  }
                                                />
                                              </Tooltip>
                                            )}
                                            <Button
                                              leftIcon={<FiMessageSquare />}
                                              variant="outline"
                                              colorScheme="green"
                                              size={"xs"}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenCommentModal(issue);
                                              }}
                                            >
                                              Comment
                                            </Button>
                                          </HStack>
                                        </Td>
                                      </Tr>
                                    ))}
                                </Tbody>
                              </Table>
                            </Box>
                            {/* </TableContainer> */}

                            {/* Pagination */}
                            {filteredIssues.filter(
                              (issue) => tab === "all" || issue.status === tab,
                            ).length > pageSize && (
                              <Flex justify="center" mt={4}>
                                <HStack spacing={3}>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiChevronLeft />}
                                    isDisabled={currentPage === 1}
                                    onClick={() =>
                                      setCurrentPage(currentPage - 1)
                                    }
                                    variant="outline"
                                  >
                                    Previous
                                  </Button>
                                  <Text fontSize="sm">
                                    Page {currentPage} of{" "}
                                    {Math.ceil(
                                      filteredIssues.filter(
                                        (issue) =>
                                          tab === "all" || issue.status === tab,
                                      ).length / pageSize,
                                    )}
                                  </Text>
                                  <Button
                                    size="sm"
                                    rightIcon={<FiChevronRight />}
                                    isDisabled={
                                      currentPage * pageSize >=
                                      filteredIssues.filter(
                                        (issue) =>
                                          tab === "all" || issue.status === tab,
                                      ).length
                                    }
                                    onClick={() =>
                                      setCurrentPage(currentPage + 1)
                                    }
                                    variant="outline"
                                  >
                                    Next
                                  </Button>
                                </HStack>
                              </Flex>
                            )}
                          </>
                        )}
                      </CardBody>
                    </Card>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      {/* </Container> */}

      {/* Create Issue Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={handleModalClose}
        size={{ base: "sm", md: "2xl" }}
        borderRadius="md"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent maxH="80vh" display="flex" flexDirection="column">
          {/* Sticky Header */}
          <ModalHeader
            position="sticky"
            top={0}
            bg={cardBg}
            zIndex={1}
            borderBottom="1px"
            borderColor={borderColor}
            py={4}
            borderRadius="md"
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="lg">Raise New Issue</Heading>
                <Text fontSize="sm" color={textColor} mt={1}>
                  Report a new issue with an asset
                </Text>
              </Box>
              <ModalCloseButton position="relative" top={0} right={0} />
            </Flex>
          </ModalHeader>

          {/* Scrollable Body */}
          <ModalBody
            flex={1}
            overflowY="auto"
            px={6}
            py={4}
            css={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: useColorModeValue("#f1f1f1", "#2D3748"),
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: useColorModeValue("#c1c1c1", "#4A5568"),
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: useColorModeValue("#a8a8a8", "#718096"),
              },
            }}
          >
            <VStack spacing={4}>
              {/* Asset ID with Scanner */}
              <FormControl isRequired>
                <FormLabel>Asset ID</FormLabel>
                <Flex gap={2}>
                  <Input
                    value={issueForm.asset_asset_id}
                    onChange={(e) => {
                      setIssueForm({ ...issueForm, asset_asset_id: e.target.value });
                      if (!e.target.value) {
                        setIssueForm((prev) => ({
                          ...prev,
                          asset_name: "",
                          asset_type: "",
                          location: "",
                          department: "",
                        }));
                      }
                    }}
                    placeholder="Enter asset ID or scan barcode"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (issueForm.asset_asset_id) {
                          fetchAssetDetails(issueForm.asset_asset_id);
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      if (issueForm.asset_asset_id) {
                        fetchAssetDetails(issueForm.asset_asset_id);
                      } else {
                        toast({
                          title: "Asset ID Required",
                          description: "Please enter an asset ID first",
                          status: "warning",
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    leftIcon={<FaSearch />}
                    isDisabled={!issueForm.asset_asset_id}
                  >
                    <Text display={{ base: "none", md: "block" }}>Search</Text>
                  </Button>
                  <Button
                    type="button"
                    colorScheme="green"
                    variant="outline"
                    onClick={handleScan}
                    leftIcon={<FaQrcode />}
                  >
                    <Text display={{ base: "none", md: "block" }}>Scan</Text>
                  </Button>
                </Flex>
                <FormHelperText>
                  Enter asset ID and click Search, or use scanner
                </FormHelperText>
              </FormControl>

              {issueForm.asset_name && (
                <SimpleGrid columns={2} spacing={4} w="100%">
                  <FormControl>
                    <FormLabel>Asset Name</FormLabel>
                    <Input
                      value={issueForm.asset_name}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Auto-filled from asset"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Asset Type</FormLabel>
                    <Input
                      value={issueForm.asset_type}
                      isReadOnly
                      bg="gray.50"
                      placeholder="Auto-filled from asset"
                    />
                  </FormControl>
                </SimpleGrid>
              )}

              <FormControl isRequired>
                <FormLabel>Issue Title</FormLabel>
                <Input
                  value={issueForm.title}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, title: e.target.value })
                  }
                  placeholder="Brief description of the issue"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={issueForm.description}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, description: e.target.value })
                  }
                  placeholder="Detailed description of the problem..."
                  rows={4}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={issueForm.priority}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Input
                    value={issueForm.category}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, category: e.target.value })
                    }
                    bg={issueForm.asset_name ? "gray.50" : "white"}
                    isReadOnly={!!issueForm.asset_name}
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={issueForm.location}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, location: e.target.value })
                    }
                    placeholder="Building, floor, room number"
                    bg={issueForm.asset_name ? "gray.50" : "white"}
                    isReadOnly={!!issueForm.asset_name}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={issueForm.department}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, department: e.target.value })
                    }
                    bg={issueForm.asset_name ? "gray.50" : "white"}
                    isReadOnly={!!issueForm.asset_name}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Attachments</FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setIssueForm({
                      ...issueForm,
                      attachments: Array.from(e.target.files),
                    })
                  }
                />
                <FormHelperText>
                  Upload screenshots, logs, or photos related to the issue
                </FormHelperText>

                {/* Show selected files */}
                {issueForm.attachments.length > 0 && (
                  <Box mt={3}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Selected Files ({issueForm.attachments.length}):
                    </Text>
                    <VStack
                      align="stretch"
                      spacing={2}
                      maxH="150px"
                      overflowY="auto"
                    >
                      {issueForm.attachments.map((file, index) => (
                        <Flex
                          key={index}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          borderColor={borderColor}
                          align="center"
                          justify="space-between"
                        >
                          <HStack spacing={3} flex={1}>
                            <Icon as={FiPaperclip} />
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="sm"
                                fontWeight="medium"
                                noOfLines={1}
                              >
                                {file.name}
                              </Text>
                              <Text fontSize="xs" color={textColor}>
                                {(file.size / 1024).toFixed(2)} KB
                              </Text>
                            </VStack>
                          </HStack>
                          <IconButton
                            aria-label="Remove file"
                            icon={<FiXCircle />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              const newAttachments = [...issueForm.attachments];
                              newAttachments.splice(index, 1);
                              setIssueForm({
                                ...issueForm,
                                attachments: newAttachments,
                              });
                            }}
                          />
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}
              </FormControl>

              {assetIssues.length > 0 && (
                <Box w="100%" pt={4}>
                  <Divider mb={4} />
                  <Heading size="sm" mb={3}>
                    Previous Issues for This Asset
                  </Heading>
                  <VStack
                    spacing={3}
                    align="stretch"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {assetIssues
                      .sort(
                        (a, b) =>
                          new Date(b.created_at) - new Date(a.created_at),
                      )
                      .map((issue) => (
                        <Card key={issue.id} size="sm" variant="outline">
                          <CardBody>
                            <VStack align="stretch" spacing={2}>
                              <Flex justify="space-between" align="start">
                                <Text
                                  fontWeight="semibold"
                                  fontSize="sm"
                                  noOfLines={1}
                                >
                                  {issue.title}
                                </Text>
                                <Badge
                                  colorScheme={
                                    issue.status === "open"
                                      ? "red"
                                      : issue.status === "in_progress"
                                        ? "blue"
                                        : issue.status === "resolved"
                                          ? "green"
                                          : "gray"
                                  }
                                  fontSize="xs"
                                >
                                  {issue.status}
                                </Badge>
                              </Flex>
                              <Text fontSize="xs" color={textColor}>
                                Created:{" "}
                                {format(
                                  new Date(issue.created_at),
                                  "MMM dd, yyyy",
                                )}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>

          {/* Sticky Footer */}
          <ModalFooter
            position="sticky"
            bottom={0}
            bg={cardBg}
            zIndex={1}
            borderTop="1px"
            borderColor={borderColor}
            py={4}
            borderRadius="md"
          >
            <Button variant="ghost" mr={3} onClick={onCreateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleCreateIssue}
              isLoading={isSubmitting}
              loadingText="Raising Issue..."
            >
              Raise Issue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Assign Issue Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={onAssignClose}
        size="lg"
        maxH="80vh"
        isCentered
        blockScrollOnMount={false}
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent maxH="80vh" display="flex" flexDirection="column">
          {/* Sticky Header */}
          <ModalHeader
            position="sticky"
            top={0}
            bg="white"
            zIndex={1}
            borderBottom="1px solid"
            borderColor="gray.200"
            py={4}
            borderRadius="md"
          >
            <Flex direction="column">
              <Heading size="lg">Assign Issue</Heading>
              <Text fontSize="sm" color={textColor} mt={1}>
                {selectedIssue
                  ? `Assign ${selectedIssue.id.substring(0, 25)}...`
                  : `Assign ${selectedIssues.length} selected issues`}
              </Text>
            </Flex>

            <ModalCloseButton top={5} right={4} />
          </ModalHeader>

          {/* Scrollable Body */}
          <ModalBody
            overflowY="auto"
            flex="1"
            px={6}
            sx={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "gray.300",
                borderRadius: "24px",
              },
            }}
          >
            {isLoadingAssignableUsers ? (
              <Flex justify="center" align="center" h="200px">
                <VStack spacing={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color={textColor}>Loading assignable users...</Text>
                </VStack>
              </Flex>
            ) : (
              <VStack spacing={4} pb={4}>
                <FormControl isRequired>
                  <FormLabel>Assign to User</FormLabel>
                  <Select
                    value={assignmentForm.assigned_to.id}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        assigned_to: e.target.value,
                      })
                    }
                    placeholder="Select user"
                    isDisabled={assignableUsers.length === 0}
                  >
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email}) -{" "}
                        {user.role}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>
                    {assignableUsers.length === 0
                      ? "No assignable users found"
                      : "Select the user to assign this issue to"}
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Update Status</FormLabel>
                  <Select
                    value={assignmentForm.status}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="assigned">Assigned</option>
                    {/* <option value="pending">Pending</option> */}
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </Select>
                  <FormHelperText>
                    Update issue status along with assignment
                  </FormHelperText>
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="100%">
                  <FormControl>
                    <FormLabel>Deadline</FormLabel>
                    <Input
                      type="date"
                      value={assignmentForm.deadline}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          deadline: e.target.value,
                        })
                      }
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </FormControl>

                  
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Notes for Assignee</FormLabel>
                  <Textarea
                    value={assignmentForm.notes}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Additional instructions, priority details, or context..."
                    rows={3}
                  />
                  <FormHelperText>
                    This note will be added as a comment to the issue
                  </FormHelperText>
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          {/* Sticky Footer */}
          <ModalFooter
            position="sticky"
            bottom={0}
            bg="white"
            zIndex={1}
            borderTop="1px solid"
            borderColor="gray.200"
            py={4}
            borderRadius="md"
          >
            <Flex w="100%" justify="right" gap={5}>
              <Button variant="ghost" onClick={onAssignClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleAssignIssue}
                isLoading={isAssigning}
                loadingText="Assigning..."
                isDisabled={
                  !assignmentForm.assigned_to || assignableUsers.length === 0
                }
              >
                Assign Issue
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Issue Detail Drawer */}
      <Drawer
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        size={{ base: "sm", md: "sm" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <Heading size="md">Issue Details</Heading>
            {selectedIssue && (
              <Text fontSize="sm" color={textColor} mt={2}>
                {selectedIssue.id} • {selectedIssue.title}
              </Text>
            )}
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody>
            {selectedIssue && (
              <VStack spacing={6} align="stretch">
                {/* Header Info */}
                <Flex justify="space-between" align="center">
                  <Badge
                    colorScheme={getPriorityColor(selectedIssue.priority)}
                    size="lg"
                  >
                    {selectedIssue.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <Badge
                    colorScheme={getStatusColor(selectedIssue.status)}
                    variant="subtle"
                    leftIcon={<Icon as={getStatusIcon(selectedIssue.status)} />}
                  >
                    {selectedIssue.status.replace("-", " ")}
                  </Badge>
                </Flex>

                {/* Description */}
                <Box>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        Description
                      </Text>
                      <Text color={textColor}>{selectedIssue.description}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="semibold" mb={2}>
                        Unit
                      </Text>
                      <Text color={textColor}>{selectedIssue.unit.name}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>

                {/* Asset Info */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Asset Information
                  </Text>
                  <Card variant="outline" p={3}>
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between">
                        <Text color={textColor}>Asset ID:</Text>
                        <Text fontWeight="medium">
                          {selectedIssue.asset_id}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color={textColor}>Asset Name:</Text>
                        <Text fontWeight="medium">
                          {selectedIssue.asset_name}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color={textColor}>Location:</Text>
                        <Text fontWeight="medium">
                          {selectedIssue.location}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color={textColor}>Department:</Text>
                        <Text fontWeight="medium">
                          {selectedIssue.department.name}
                        </Text>
                      </Flex>
                    </VStack>
                  </Card>
                </Box>

                {/* Timeline */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Timeline
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    <Flex justify="space-between">
                      <Text color={textColor}>Reported:</Text>
                      <Text fontWeight="medium">
                        {formatDate(selectedIssue.reported_date)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color={textColor}>Estimated Resolution:</Text>
                      <Text fontWeight="medium">
                        {formatDate(selectedIssue.estimated_resolution)}
                      </Text>
                    </Flex>
                    {selectedIssue.actualResolution && (
                      <Flex justify="space-between">
                        <Text color={textColor}>Actual Resolution:</Text>
                        <Text fontWeight="medium" color="green.500">
                          {formatDate(selectedIssue.actual_resolution)}
                        </Text>
                      </Flex>
                    )}
                    <Flex justify="space-between">
                      <Text color={textColor}>Last Updated:</Text>
                      <Text fontWeight="medium">
                        {getTimeAgo(selectedIssue.last_updated)}
                      </Text>
                    </Flex>
                  </VStack>
                </Box>

                {/* Assignment Info */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Assignment
                  </Text>
                  <Card variant="outline" p={3}>
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between">
                        <Text color={textColor}>Reported By:</Text>
                        <Text fontWeight="medium">
                          {selectedIssue.reported_by}
                        </Text>
                      </Flex>
                      {selectedIssue.assigned_to && (
                        <Flex justify="space-between">
                          <Text color={textColor}>Assigned To:</Text>
                          <Text fontWeight="medium">
                            {selectedIssue.assigned_to.name || "Unassigned"}
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Card>
                </Box>

                {/* Tags */}
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    Tags
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {selectedIssue.tags.map((tag, index) => (
                      <Badge key={index} colorScheme="gray" variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                {/* Attachments Section */}
                <Box>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="space-between"
                    onClick={() => setShowAttachments(!showAttachments)}
                    mb={showAttachments ? 3 : 0}
                  >
                    <Flex align="center">
                      <Icon as={FiPaperclip} mr={2} />
                      <Text fontWeight="semibold">
                        Attachments ({selectedIssue.images?.length || 0})
                      </Text>
                    </Flex>
                    <Icon
                      as={showAttachments ? FiChevronUp : FiChevronDown}
                      transition="transform 0.2s"
                    />
                  </Button>

                  <Collapse in={showAttachments}>
                    <Card variant="outline" p={3}>
                      <VStack align="stretch" spacing={3}>
                        {selectedIssue.images &&
                        selectedIssue.images.length > 0 ? (
                          selectedIssue.images.map((imgUrl, index) => {
                            let fileName = `Attachment ${index + 1}`;
                            try {
                              if (selectedIssue.image_public_ids) {
                                const publicIds = typeof selectedIssue.image_public_ids === 'string' 
                                  ? JSON.parse(selectedIssue.image_public_ids) 
                                  : selectedIssue.image_public_ids;
                                if (Array.isArray(publicIds) && publicIds[index]) {
                                  fileName = publicIds[index].split("/").pop();
                                }
                              }
                            } catch (e) {
                              console.error("Error parsing image_public_ids", e);
                            }

                            return (
                              <Flex
                                key={index}
                                justify="space-between"
                                align="center"
                                p={2}
                                bg={bgColor}
                                borderRadius="md"
                              >
                                <HStack spacing={3}>
                                  <Box
                                    borderRadius="md"
                                    overflow="hidden"
                                    border="1px solid"
                                    borderColor={borderColor}
                                    boxSize="40px"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={fileName}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                      {fileName}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      Image Attachment
                                    </Text>
                                  </VStack>
                                </HStack>
                                <HStack>
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<FiEye />}
                                    onClick={() => window.open(imgUrl, "_blank")}
                                    aria-label="View attachment"
                                  />
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    icon={<FiDownload />}
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.href = imgUrl;
                                      link.target = "_blank";
                                      link.download = fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    aria-label="Download attachment"
                                  />
                                </HStack>
                              </Flex>
                            );
                          })
                        ) : (
                          <Text
                            color="gray.500"
                            fontSize="sm"
                            textAlign="center"
                            py={4}
                          >
                            No attachments uploaded
                          </Text>
                        )}

                        {/* Upload new attachment button */}
                        <Button
                          leftIcon={<FiUpload />}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onDetailClose();
                            // Handle upload attachment logic here
                          }}
                        >
                          Upload New Attachment
                        </Button>
                      </VStack>
                    </Card>
                  </Collapse>
                </Box>

                {/* Comments Section */}
                <Box>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="space-between"
                    onClick={() => setShowComments(!showComments)}
                    mb={showComments ? 3 : 0}
                  >
                    <Flex align="center">
                      <Icon as={FiMessageSquare} mr={2} />
                      <Text fontWeight="semibold">
                        Comments ({selectedIssue.comments?.length || 0})
                      </Text>
                    </Flex>
                    <Icon
                      as={showComments ? FiChevronUp : FiChevronDown}
                      transition="transform 0.2s"
                    />
                  </Button>

                  <Collapse in={showComments}>
                    <Card variant="outline" p={3}>
                      <VStack align="stretch" spacing={4}>
                        {/* Comments List */}
                        <VStack
                          align="stretch"
                          spacing={3}
                          maxH="300px"
                          overflowY="auto"
                        >
                          {selectedIssue.comments &&
                          selectedIssue.comments.length > 0 ? (
                            selectedIssue.comments.map((comment, index) => (
                              <Box
                                key={index}
                                p={3}
                                bg={bgColor}
                                borderRadius="md"
                                borderLeft="4px solid"
                                borderLeftColor="blue.400"
                              >
                                <Flex
                                  justify="space-between"
                                  mb={2}
                                  align="center"
                                >
                                  <HStack>
                                    <Avatar
                                      size="xs"
                                      name={comment.created_by?.name || "User"}
                                    />
                                    <Text fontWeight="semibold" fontSize="sm">
                                      {comment.created_by?.name || "Anonymous"}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.500">
                                    {getTimeAgo(comment.created_at)}
                                  </Text>
                                </Flex>
                                <Text fontSize="sm" color={textColor} mb={2}>
                                  {comment.description}
                                </Text>
                                {comment.images &&
                                  comment.images.length > 0 && (
                                    <HStack mt={2} spacing={2} wrap="wrap">
                                      {comment.images.map(
                                        (imgUrl, imgIndex) => (
                                          <Box
                                            key={imgIndex}
                                            borderRadius="md"
                                            overflow="hidden"
                                            border="1px solid"
                                            borderColor={borderColor}
                                          >
                                            <img
                                              src={imgUrl}
                                              alt={`Attachment ${imgIndex + 1}`}
                                              style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                              }}
                                            />
                                          </Box>
                                        ),
                                      )}
                                    </HStack>
                                  )}
                              </Box>
                            ))
                          ) : (
                            <Text
                              color="gray.500"
                              fontSize="sm"
                              textAlign="center"
                              py={4}
                            >
                              No comments yet
                            </Text>
                          )}
                        </VStack>

                        {/* Add new comment input */}
                        <Box>
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            size="sm"
                            mb={2}
                            resize="vertical"
                            minH="80px"
                          />
                          <Flex justify="space-between" align="center">
                            <Button
                              leftIcon={<FiPaperclip />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Handle attach file to comment
                              }}
                            >
                              Attach File
                            </Button>
                            <Button
                              colorScheme="blue"
                              size="sm"
                              isDisabled={!newComment.trim()}
                              onClick={() => {
                                handleAddComment(selectedIssue.id, newComment);
                                setNewComment("");
                              }}
                            >
                              Post Comment
                            </Button>
                          </Flex>
                        </Box>
                      </VStack>
                    </Card>
                  </Collapse>
                </Box>
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            {selectedIssue && (
              <HStack spacing={3}>
                <Button
                  size={{ base: "xs", md: "sm" }}
                  leftIcon={<FiMessageSquare />}
                  colorScheme="blue"
                  variant="solid"
                  onClick={() => {
                    onDetailClose();
                    handleOpenCommentModal(selectedIssue);
                  }}
                >
                  <Text display={{ base: "none", md: "block" }}>Comment</Text>
                </Button>
                {(can_comment_and_can_assign ||
                  (selectedIssue.assigned_to === null &&
                    userRole === "service_user")) && (
                  <HStack>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<MdOutlineAssignment />}
                      colorScheme="blue"
                      onClick={() => {
                        onDetailClose();
                        onAssignOpen();
                      }}
                    >
                      Assign
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<FiCheckCircle />}
                      colorScheme="green"
                      onClick={() => {
                        const updatedIssues = issues.map((issue) =>
                          issue.id === selectedIssue.id
                            ? {
                                ...issue,
                                status: "resolved",
                                actualResolution: format(
                                  new Date(),
                                  "yyyy-MM-dd",
                                ),
                              }
                            : issue,
                        );
                        setIssues(updatedIssues);
                        onDetailClose();
                      }}
                    >
                      Mark Resolved
                    </Button>
                  </HStack>
                )}
              </HStack>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* QR Code Scanner Modal */}
      <Modal isOpen={isScannerOpen} onClose={onScannerClose} size="lg">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Scan Asset QR Code</Heading>
            <Text fontSize="sm" color={textColor} mt={2}>
              Position the QR code within the camera frame
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box
                id="scanner-container"
                width="100%"
                minH="300px"
                bg={subtleBg}
                borderRadius="md"
                overflow="hidden"
              />
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  Allow camera access to scan QR codes from assets
                </Text>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onScannerClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Issue;
