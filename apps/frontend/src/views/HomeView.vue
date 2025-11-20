<template>
  <main class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Your Images</h1>

    <!-- Image Upload Section -->
    <section class="mb-8 p-6 border rounded-lg shadow-sm bg-white">
      <h2 class="text-2xl font-semibold mb-4">Upload New Image</h2>
      <form @submit.prevent="handleUpload" class="space-y-4">
        <div>
          <label for="file-upload" class="block text-sm font-medium text-gray-700"
            >Select Image</label
          >
          <input
            id="file-upload"
            type="file"
            @change="onFileChange"
            accept="image/*"
            class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          :disabled="!selectedFile || uploading"
          class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ uploading ? 'Uploading...' : 'Upload Image' }}
        </button>
        <p v-if="uploadError" class="text-red-500 text-sm mt-2">{{ uploadError }}</p>
      </form>
    </section>

    <!-- Image List Section -->
    <section class="mb-8 p-6 border rounded-lg shadow-sm bg-white">
      <h2 class="text-2xl font-semibold mb-4">My Uploaded Images</h2>
      <div v-if="loadingImages" class="text-center text-gray-500">Loading images...</div>
      <div v-else-if="images.length === 0" class="text-center text-gray-500">
        No images uploaded yet.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="image in images"
          :key="image.id"
          class="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <img
            :src="image.thumbnail_url || image.url"
            :alt="image.filename"
            class="w-full h-48 object-cover cursor-pointer"
            @click="openPreview(image)"
          />
          <div class="p-3">
            <p class="text-sm font-medium text-gray-800 truncate">{{ image.filename }}</p>
            <button
              @click="deleteImage(image.id)"
              class="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <p v-if="imagesError" class="text-red-500 text-sm mt-2">{{ imagesError }}</p>
    </section>

    <!-- Image Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto relative">
        <button
          @click="closePreview"
          class="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>
        <img
          :src="currentPreviewImage?.url"
          :alt="currentPreviewImage?.filename"
          class="max-w-full h-auto"
        />
        <div class="mt-4 text-center">
          <p class="text-lg font-semibold">{{ currentPreviewImage?.filename }}</p>
          <a
            :href="currentPreviewImage?.url"
            target="_blank"
            download
            class="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSession } from '@clerk/vue'
import { onMounted, ref } from 'vue'

interface Image {
  id: string
  user_id: string
  filename: string
  mimetype: string
  size: number
  url: string
  thumbnail_url: string
  created_at: string
}

const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

const images = ref<Image[]>([])
const loadingImages = ref(true)
const imagesError = ref<string | null>(null)

const showPreview = ref(false)
const currentPreviewImage = ref<Image | null>(null)

const backendUrl = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:3000' // Ensure this is set in your .env

const onFileChange = (event: Event) => {
  const target = (event as any).target
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]!
    uploadError.value = null
  } else {
    selectedFile.value = null
  }
}

const { session } = useSession()
const handleUpload = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Please select a file to upload.'
    return
  }

  uploading.value = true
  uploadError.value = null

  try {
    const token = await session.value?.getToken()
    if (!token) {
      throw new Error('Authentication token not found. Please log in.')
    }

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch(`${backendUrl}/images/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload image.')
    }

    selectedFile.value = null
    await fetchImages() // Refresh image list
  } catch (error: unknown) {
    uploadError.value = (error as Error).message
    console.error('Upload error:', error)
  } finally {
    uploading.value = false
  }
}

const fetchImages = async () => {
  loadingImages.value = true
  imagesError.value = null
  try {
    const token = await session.value?.getToken()
    if (!token) {
      throw new Error('Authentication token not found. Please log in.')
    }

    const response = await fetch(`${backendUrl}/images`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch images.')
    }

    images.value = await response.json()
  } catch (error: unknown) {
    imagesError.value = (error as Error).message
    console.error('Fetch images error:', error)
  } finally {
    loadingImages.value = false
  }
}

const deleteImage = async (imageId: string) => {
  if (!confirm('Are you sure you want to delete this image?')) {
    return
  }

  try {
    const token = await session.value?.getToken()
    if (!token) {
      throw new Error('Authentication token not found. Please log in.')
    }

    const response = await fetch(`${backendUrl}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete image.')
    }

    await fetchImages() // Refresh image list
  } catch (error: unknown) {
    imagesError.value = (error as Error).message
    console.error('Delete image error:', error)
  }
}

const openPreview = (image: Image) => {
  currentPreviewImage.value = image
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  currentPreviewImage.value = null
}

onMounted(() => {
  fetchImages()
})
</script>
