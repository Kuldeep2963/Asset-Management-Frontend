import { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  FormErrorMessage,
  FormHelperText,
  VStack,
  Box,
  Flex,
  Icon,
  Text,
  Heading,
  SimpleGrid,
  Image,
  IconButton,
  Input,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { FiMessageSquare, FiPaperclip, FiX } from 'react-icons/fi';
import api from '../../services/api';

// Modal for adding comments
const CommentModal = ({ isOpen, onClose, issueId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create FormData for the API call
      const formData = new FormData();
      
      // Add description to FormData
      formData.append('description', comment.trim());
      
      // Add images to FormData
      if (images.length > 0) {
        images.forEach((file) => {
          formData.append('images', file);
        });
      }

      // Make API call using the api service with FormData
      const response = await api.post(`/api/issues/${issueId}/comments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      
      // Reset form
      setComment('');
      setImages([]);
      setImageUrls([]);
      
      // Callback for parent component
      if (onCommentAdded) {
        onCommentAdded(data);
      }
      
      // Close modal
      onClose();
      
      // Show success message
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to add comment. Please try again.';
      if (error.response?.data) {
        // Handle different possible error response formats
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.description) {
          errorMessage = error.response.data.description[0];
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a valid image file`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
      
      if (!isValidSize) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
      
      return isValidType && isValidSize;
    });
    
    // Check if adding these files would exceed the limit
    if (images.length + validFiles.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can only upload up to 5 images',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create preview URLs
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...validFiles]);
    setImageUrls(prev => [...prev, ...newImageUrls]);
    
    // Clear the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    // Revoke object URL to prevent memory leaks
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    // Clean up object URLs
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setComment('');
    setImages([]);
    setImageUrls([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">
            <Icon as={FiMessageSquare} mr={2} />
            Add Comment
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Issue #{issueId?.substring(0, 8).toUpperCase()}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Comment Input */}
            <FormControl isRequired isInvalid={!!error}>
              <FormLabel>Comment</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError('');
                }}
                placeholder="Type your comment here..."
                rows={6}
                resize="vertical"
                autoFocus
              />
              <FormErrorMessage>{error}</FormErrorMessage>
              <FormHelperText>
                Be specific and provide relevant details
              </FormHelperText>
            </FormControl>

            {/* Image Upload */}
            <FormControl>
              <FormLabel>
                <Flex align="center" gap={2}>
                  <Icon as={FiPaperclip} />
                  Attach Images ({images.length}/5)
                </Flex>
              </FormLabel>
              
              {/* Image Preview */}
              {imageUrls.length > 0 && (
                <SimpleGrid columns={3} spacing={2} mb={3}>
                  {imageUrls.map((url, index) => (
                    <Box key={index} position="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        borderRadius="md"
                        objectFit="cover"
                        w="100%"
                        h="80px"
                        border="1px solid"
                        borderColor="gray.200"
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<FiX />}
                        size="xs"
                        colorScheme="red"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => removeImage(index)}
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              )}
              
              {/* Upload Button */}
              <Flex gap={2}>
                <Button
                  leftIcon={<FiPaperclip />}
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isDisabled={images.length >= 5}
                >
                  Add Images ({images.length}/5)
                </Button>
                {images.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    colorScheme="red"
                    onClick={() => {
                      // Clean up all object URLs
                      imageUrls.forEach(url => URL.revokeObjectURL(url));
                      setImages([]);
                      setImageUrls([]);
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Flex>
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                display="none"
              />
              <FormHelperText>
                Maximum 5 images, 5MB each. Supported formats: JPG, PNG, GIF, WebP
              </FormHelperText>
            </FormControl>

            {/* Upload Progress (optional) */}
            {isSubmitting && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Uploading {images.length > 0 ? 'images and ' : ''}comment...
                </Text>
                <Progress size="xs" isIndeterminate colorScheme="blue" />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Adding Comment..."
            leftIcon={<FiMessageSquare />}
            isDisabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CommentModal;