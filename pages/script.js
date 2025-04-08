// Global variables
let allPosts = [];
let currentPage = 1;
const postsPerPage = 10;
let filteredPosts = [];

// DOM elements
const postsTable = document.getElementById("posts-table");
const searchInput = document.getElementById("search-input");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const postCount = document.getElementById("post-count");
const rerumCount = document.getElementById("rerum-count");
const userPostsTable = document.getElementById("user-posts-table");

// Modal elements
const commentsModal = document.getElementById("comments-modal");
const closeModalBtn = document.getElementById("close-modal");
const commentsContainer = document.getElementById("comments-container");
const loadingComments = document.getElementById("loading-comments");
const noComments = document.getElementById("no-comments");
const postIdPlaceholder = document.getElementById("post-id-placeholder");

// Render posts to the table
function renderPosts() {
  if (filteredPosts.length === 0) {
    postsTable.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-gray-500">No posts found matching your search.</td>
      </tr>
    `;
    return;
  }

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const postsToDisplay = filteredPosts.slice(startIndex, endIndex);

  let tableHTML = "";

  postsToDisplay.forEach((post) => {
    const hasRerum = post.body.toLowerCase().includes("rerum");
    const rowClass = hasRerum ? "rerum-highlight" : "";

    tableHTML += `
      <tr class="${rowClass} hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${post.id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.userId}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${post.title}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${post.body}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button onclick="fetchComments(${post.id})" class="text-indigo-600 hover:text-indigo-900">
                <i class="fas fa-comments mr-1"></i> View
            </button>
          </td>
      </tr>
    `;
  });

  postsTable.innerHTML = tableHTML;
  postCount.textContent = `Showing ${startIndex + 1}-${Math.min(
    endIndex,
    filteredPosts.length
  )} of ${filteredPosts.length} posts`;
}

// Update pagination buttons
function updatePagination() {
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages || filteredPosts.length === 0;

  if (filteredPosts.length === 0) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

// Generate reports
function generateReports() {
  // Count posts with "rerum" in body
  const rerumPosts = allPosts.filter((post) =>
    post.body.toLowerCase().includes("rerum")
  );
  rerumCount.textContent = rerumPosts.length;

  // Count posts per user
  const userPostCounts = {};
  allPosts.forEach((post) => {
    if (userPostCounts[post.userId]) {
      userPostCounts[post.userId]++;
    } else {
      userPostCounts[post.userId] = 1;
    }
  });

  // Render user post counts table
  let userTableHTML = "";
  for (const userId in userPostCounts) {
    userTableHTML += `
      <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${userId}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userPostCounts[userId]}</td>
      </tr>
    `;
  }

  userPostsTable.innerHTML = userTableHTML;
}

// Fetch posts from API
async function fetchPosts() {
  // Show loading spinner
  postsTable.innerHTML = `<tr>
    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
      <div class="text-center py-8">
        <div class="inline-block loading-spinner">
          <i class="fas fa-spinner text-3xl text-blue-500"></i>
        </div>
        <p class="mt-2 text-gray-600">Loading posts...</p>
      </div>
    </td>
  </tr>`;

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    allPosts = await response.json();
    filteredPosts = [...allPosts];

    renderPosts();
    updatePagination();
    generateReports();
  } catch (error) {
    postsTable.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading posts. Please try again later.</td>
      </tr>
    `;

    userPostsTable.innerHTML = `
      <tr>
        <td colspan="2" class="px-6 py-4 text-center text-red-500">No posts found.</td>
      </tr>
    `;
  }
}

// Show comments modal and fetch comments from API
async function fetchComments(postId) {
  postIdPlaceholder.textContent = postId;

  // Show modal
  commentsModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // Reset UI
  commentsContainer.innerHTML = "";
  loadingComments.classList.remove("hidden");
  noComments.classList.add("hidden");

  try {
    // Fetch comments
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}/comments`
    );
    const comments = await response.json();

    loadingComments.classList.add("hidden");

    if (comments.length === 0) {
      noComments.classList.remove("hidden");
      return;
    }

    // Render comments
    let commentsHTML = "";
    comments.forEach((comment) => {
      commentsHTML += `
        <div class="mb-6 p-4 border border-gray-200 rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <i class="fas fa-user"></i>
            </div>
            <div class="ml-4">
                <h4 class="text-sm font-medium text-gray-900">${comment.name}</h4>
                <p class="text-xs text-indigo-600">${comment.email}</p>
                <p class="mt-1 text-sm text-gray-600">${comment.body}</p>
            </div>
          </div>
        </div>
      `;
    });
    commentsContainer.innerHTML = commentsHTML;
  } catch (error) {
    loadingComments.classList.add("hidden");
    commentsContainer.innerHTML = `
      <div class="bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
              <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                  <p class="text-sm text-red-700">Failed to load comments. Please try again.</p>
              </div>
          </div>
      </div>
    `;
  }
}

// Close modal
function closeModal() {
  commentsModal.classList.add("hidden");
  document.body.style.overflow = "auto";
}

// Switch between pages
function switchPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((el) => el.classList.remove("active"));

  if (page === "posts") {
    document.getElementById("posts-page").classList.add("active");
    document.getElementById("posts-tab").classList.add("active");
  } else {
    document.getElementById("reports-page").classList.add("active");
    document.getElementById("reports-tab").classList.add("active");
  }
}

// Filter posts based on search input
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase();

  if (searchTerm === "") {
    filteredPosts = [...allPosts];
  } else {
    filteredPosts = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.body.toLowerCase().includes(searchTerm)
    );
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();

  // Search functionality
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    filterPosts();
    renderPosts();
    updatePagination();
  });

  // Previous Pagination buttons
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPosts();
      updatePagination();
    }
  });

  // Next Pagination buttons
  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPosts();
      updatePagination();
    }
  });

  // Modal close button
  closeModalBtn.addEventListener("click", () => {
    closeModal();
  });

  // Close modal when clicking outside
  commentsModal.addEventListener("click", (e) => {
    if (e.target === commentsModal) {
      closeModal();
    }
  });

  // Close modal with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && commentsModal.classList.contains("active")) {
      closeModal();
    }
  });
});
