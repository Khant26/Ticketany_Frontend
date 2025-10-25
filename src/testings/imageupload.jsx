import React, { useState, useEffect } from 'react'

function ImageUpload() {
  // Form state for event data
  const [formData, setFormData] = useState({
    event_name: '',
    event_location: '',
    event_time: '',
    event_date: '',
    sale_date: '',
    ticket_price: '',
    category: 1
  });
  
  // Image handling state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Events display state
  const [events, setEvents] = useState([]);
  const [fetchingEvents, setFetchingEvents] = useState(false);

  // Configuration
  const MAX_FILES = 10;
  const MAX_SIZE_MB = 5;

  // Fetch events from backend on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setFetchingEvents(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/events/');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        console.log('Fetched events:', data);
        
        // Debug: Check the structure of event_images for each event
        data.forEach((event, index) => {
          console.log(`Event ${index + 1} (${event.event_name}):`);
          console.log('- event_image:', typeof event.event_image, event.event_image ? 'EXISTS' : 'NULL');
          console.log('- event_images:', typeof event.event_images, Array.isArray(event.event_images) ? `Array[${event.event_images.length}]` : event.event_images);
          if (event.event_images && Array.isArray(event.event_images)) {
            console.log('- First event_images item:', typeof event.event_images[0], event.event_images[0]?.substring(0, 50) + '...');
          }
        });
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Truncate long file names for display
  const truncateFileName = (fileName, maxLength = 30) => {
    if (!fileName || fileName.length <= maxLength) return fileName;
    
    const lastDot = fileName.lastIndexOf('.');
    const extension = lastDot > -1 ? fileName.slice(lastDot) : '';
    const base = lastDot > -1 ? fileName.slice(0, lastDot) : fileName;
    
    const keep = Math.floor((maxLength - extension.length - 3) / 2);
    const start = base.slice(0, keep);
    const end = base.slice(-keep);
    
    return `${start}...${end}${extension}`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Filter valid image files within size limit
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const withinSize = file.size <= MAX_SIZE_MB * 1024 * 1024;
      
      if (!isImage) {
        console.warn(`Skipped non-image file: ${file.name}`);
        return false;
      }
      if (!withinSize) {
        setUploadStatus(`File ${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    // Merge with existing files and remove duplicates
    const existingFiles = [...selectedFiles];
    const mergedFiles = [...existingFiles];
    
    validFiles.forEach(newFile => {
      const isDuplicate = existingFiles.some(existing => 
        existing.name === newFile.name && existing.size === newFile.size
      );
      if (!isDuplicate) {
        mergedFiles.push(newFile);
      }
    });

    // Limit to MAX_FILES
    const finalFiles = mergedFiles.slice(0, MAX_FILES);
    if (mergedFiles.length > MAX_FILES) {
      setUploadStatus(`Limited to first ${MAX_FILES} images`);
    }

    setSelectedFiles(finalFiles);
    createPreviews(finalFiles);
  };

  const createPreviews = (files) => {
    const newPreviews = [];
    let loadedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = {
          url: e.target.result,
          name: file.name,
          size: file.size
        };
        loadedCount++;
        if (loadedCount === files.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    
    // Clear input if no files remain
    if (newFiles.length === 0) {
      const fileInput = document.getElementById('image-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Compress and convert image to base64
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = (width * maxWidth) / height;
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Fill with white background and draw image
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Helper to convert empty strings to null for backend
  const toNullIfEmpty = (value) => {
    return value === '' ? null : value;
  };

  const uploadEvent = async () => {
    if (!formData.event_name.trim()) {
      setUploadStatus('Please enter an event name');
      return;
    }

    setLoading(true);
    setUploadStatus('Processing images...');

    try {
      // Compress all selected images to base64
      const compressedImages = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadStatus(`Processing image ${i + 1} of ${selectedFiles.length}...`);
        const compressedBase64 = await compressImage(file);
        compressedImages.push(compressedBase64);
      }

      // Prepare payload for backend
      // WORKAROUND: Since backend doesn't support event_images array yet,
      // we'll store multiple images as a comma-separated string in event_image
      const payload = {
        event_name: formData.event_name,
        event_location: toNullIfEmpty(formData.event_location),
        event_time: toNullIfEmpty(formData.event_time),
        event_date: toNullIfEmpty(formData.event_date),
        sale_date: toNullIfEmpty(formData.sale_date),
        ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : null,
        category: parseInt(formData.category),
        // Store all images as comma-separated string (temporary workaround)
        event_image: compressedImages.length > 0 ? compressedImages.join('|||SEPARATOR|||') : null
      };

      console.log('Payload prepared (WORKAROUND MODE):', {
        ...payload,
        event_image: payload.event_image ? `[${compressedImages.length} images separated by |||SEPARATOR|||]` : null
      });

      // Debug: Log the actual event_images array structure
      console.log('Original images array:', compressedImages);
      console.log('Combined string length:', payload.event_image?.length);
      console.log('First image preview:', compressedImages[0]?.substring(0, 50) + '...');

      await sendEventData(payload);

    } catch (error) {
      console.error('Error processing upload:', error);
      setUploadStatus('❌ Error processing images: ' + error.message);
      setLoading(false);
    }
  };

  const sendEventData = async (payload) => {
    try {
      setUploadStatus('Uploading to server...');
      
      const response = await fetch('http://127.0.0.1:8000/api/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type');
      const responseData = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (response.ok) {
        setUploadStatus(`✅ Event "${payload.event_name}" created successfully!`);
        console.log('Event created:', responseData);
        
        // Reset form
        setFormData({
          event_name: '',
          event_location: '',
          event_time: '',
          event_date: '',
          sale_date: '',
          ticket_price: '',
          category: 1
        });
        setSelectedFiles([]);
        setPreviews([]);
        
        // Clear file input
        const fileInput = document.getElementById('image-input');
        if (fileInput) fileInput.value = '';
        
        // Refresh events list
        fetchEvents();
        
      } else {
        console.error('Server error:', responseData);
        const errorMsg = typeof responseData === 'string' 
          ? responseData 
          : JSON.stringify(responseData);
        setUploadStatus(`❌ Failed to create event: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setUploadStatus('❌ Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/events/${eventId}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUploadStatus('✅ Event deleted successfully');
        fetchEvents(); // Refresh list
      } else {
        setUploadStatus('❌ Failed to delete event');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setUploadStatus('❌ Error deleting event: ' + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Event Creation Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h2>
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="event_location"
              value={formData.event_location}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Time
            </label>
            <input
              type="time"
              name="event_time"
              value={formData.event_time}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Date
            </label>
            <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Price
            </label>
            <input
              type="number"
              step="0.01"
              name="ticket_price"
              value={formData.ticket_price}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Music</option>
              <option value={2}>Sports</option>
              <option value={3}>Arts</option>
              <option value={4}>Technology</option>
              <option value={5}>Other</option>
            </select>
          </div>
        </div>

        {/* Multiple Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Images ({selectedFiles.length} selected)
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select multiple images (max {MAX_FILES}, {MAX_SIZE_MB}MB each). Images will be compressed automatically.
          </p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Files:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                      {truncateFileName(file.name)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Previews */}
        {previews.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview ({previews.length} images):</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={uploadEvent}
          disabled={!formData.event_name.trim() || loading}
          className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
            !formData.event_name.trim() || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating Event...' : `Create Event${selectedFiles.length > 0 ? ` with ${selectedFiles.length} image(s)` : ''}`}
        </button>

        {/* Status Message */}
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md ${
            uploadStatus.includes('✅') || uploadStatus.includes('success')
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {uploadStatus}
          </div>
        )}
      </div>

      {/* TODO: Add events display section */}

      {/* Events Display Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Uploaded Events ({events.length})
          </h2>
          <button
            onClick={fetchEvents}
            disabled={fetchingEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {fetchingEvents ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {fetchingEvents ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No events found</p>
            <p className="text-gray-500 text-sm mt-2">Create an event above to see it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              // Helper to get cover image from event
              const getCoverImage = (event) => {
                // WORKAROUND: Parse multiple images from comma-separated string
                if (event.event_image && typeof event.event_image === 'string') {
                  if (event.event_image.includes('|||SEPARATOR|||')) {
                    // Multiple images stored as separated string
                    const images = event.event_image.split('|||SEPARATOR|||');
                    return images[0]; // First image as cover
                  } else {
                    // Single image
                    return event.event_image;
                  }
                }
                return null;
              };

              // Helper to get total image count
              const getImageCount = (event) => {
                // WORKAROUND: Count images in comma-separated string
                if (event.event_image && typeof event.event_image === 'string') {
                  if (event.event_image.includes('|||SEPARATOR|||')) {
                    return event.event_image.split('|||SEPARATOR|||').length;
                  } else {
                    return 1;
                  }
                }
                return 0;
              };

              const coverImage = getCoverImage(event);
              const imageCount = getImageCount(event);

              return (
                <div key={event.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Event Image */}
                  <div className="relative h-48 bg-gray-200">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={event.event_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    
                    {/* Fallback for failed image loads */}
                    <div className="w-full h-full bg-gray-200 items-center justify-center absolute top-0 left-0" style={{display: 'none'}}>
                      <span className="text-gray-500">Image Failed</span>
                    </div>

                    {/* Multiple Images Badge */}
                    {imageCount > 1 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        +{imageCount - 1} more
                      </div>
                    )}

                    {/* Image Count Badge */}
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      {imageCount} image{imageCount !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                      {event.event_name}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      {event.event_location && (
                        <p><span className="font-medium">Location:</span> {event.event_location}</p>
                      )}
                      {event.event_date && (
                        <p><span className="font-medium">Date:</span> {new Date(event.event_date).toLocaleDateString()}</p>
                      )}
                      {event.event_time && (
                        <p><span className="font-medium">Time:</span> {event.event_time}</p>
                      )}
                      {event.ticket_price && (
                        <p><span className="font-medium">Price:</span> ${event.ticket_price}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/events/${event.id}`, '_blank')}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUpload