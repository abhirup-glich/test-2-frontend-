let isSignUp = false;
let isFaceCaptured = false;
let videoStream = null;
let capturedImageData = null;

// Show loading state
function showLoadingState() {
  const cameraPlaceholder = document.getElementById('camera-placeholder');
  const video = document.getElementById('video');
  
  // Show loading animation
  cameraPlaceholder.innerHTML = `
    <div class="loading-spinner"></div>
    <p class="loading-text">Scanning your face...</p>
  `;
  cameraPlaceholder.classList.remove('hidden');
  video.classList.add('hidden');
}

// Show error message
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Remove any existing error messages
  const existingError = document.querySelector('.error-message');
  if (existingError) existingError.remove();
  
  // Insert error message
  const form = document.getElementById('auth-form');
  form.insertBefore(errorElement, form.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// Show success message
function showSuccess(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message'; // Reusing error style for now, or add success style
    errorElement.style.background = 'rgba(16, 185, 129, 0.1)';
    errorElement.style.border = '1px solid rgba(16, 185, 129, 0.2)';
    errorElement.style.color = '#10B981';
    errorElement.textContent = message;
    
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const form = document.getElementById('auth-form');
    form.insertBefore(errorElement, form.firstChild);

    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Initialize camera
async function initCamera() {
  try {
    showLoadingState();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' }
    });

    const video = document.getElementById('video');
    const placeholder = document.getElementById('camera-placeholder');
    const liveIndicator = document.getElementById('live-indicator');
    const scanLine = document.getElementById('scan-line');

    videoStream = stream;
    video.srcObject = stream;
    video.play();
    
    video.classList.remove('hidden');
    placeholder.classList.add('hidden');
    liveIndicator.classList.remove('hidden');
    scanLine.classList.remove('hidden');
  } catch (err) {
    console.error('Error accessing camera:', err);
    const statusElement = document.getElementById('camera-status');
    statusElement.textContent = 'Camera access denied. Please enable camera permissions.';
  }
}

// Toggle between Sign In and Sign Up
function toggleAuthMode() {
  isSignUp = !isSignUp;
  const captureBtn = document.getElementById('capture-btn');
  const submitBtn = document.getElementById('submit-btn');
  const tooltip = document.getElementById('submit-tooltip');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const nameGroup = document.getElementById('name-group');
  const rollGroup = document.getElementById('roll-group');
  const courseGroup = document.getElementById('course-group');
  const formOptions = document.getElementById('form-options');
  const toggleText = document.getElementById('toggle-text');
  const toggleBtn = document.getElementById('toggle-btn');

  // Reset capture state
  isFaceCaptured = false;
  capturedImageData = null;
  captureBtn.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
      Capture Face
    `;
  captureBtn.style.background = '';
  captureBtn.style.color = '';
  submitBtn.disabled = true;
  tooltip.textContent = 'Please capture your face first';

  if (isSignUp) {
    // Sign Up Mode
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Sign up to get started';
    
    nameGroup.classList.remove('hidden');
    rollGroup.classList.remove('hidden');
    courseGroup.classList.remove('hidden');
    
    formOptions.classList.add('hidden');
    submitBtn.textContent = 'Sign Up';
    toggleText.textContent = 'Already have an account?';
    toggleBtn.textContent = 'Sign In';
    
    captureBtn.classList.remove('hidden');

  } else {
    // Sign In Mode (Face ID)
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Identify yourself';
    
    nameGroup.classList.add('hidden');
    rollGroup.classList.add('hidden');
    courseGroup.classList.add('hidden');
    
    formOptions.classList.remove('hidden');
    submitBtn.textContent = 'Identify Me';
    toggleText.textContent = "Don't have an account?";
    toggleBtn.textContent = 'Sign Up';
    
    captureBtn.classList.remove('hidden');
  }
}

// Capture face from video
function captureFace() {
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  const submitBtn = document.getElementById('submit-btn');
  const captureBtn = document.getElementById('capture-btn');
  const tooltip = document.getElementById('submit-tooltip');
  
  // Set canvas dimensions to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Draw current video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Store captured image data
  capturedImageData = canvas.toDataURL('image/jpeg');

  // Show success feedback
  captureBtn.innerHTML = `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    Face Captured
  `;
  captureBtn.style.background = '#10B981';
  captureBtn.style.color = 'white';
  
  // Enable submit button
  isFaceCaptured = true;
  submitBtn.disabled = false;
  tooltip.textContent = isSignUp ? 'Click to complete sign up' : 'Click to identify';
}

// Handle form submission
async function handleSubmit(event) {
  event.preventDefault();
  
  if (!isFaceCaptured || !capturedImageData) {
    showError('Please capture your face first');
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
      if (isSignUp) {
          const name = document.getElementById('name').value;
          const roll = document.getElementById('roll').value;
          const course = document.getElementById('course').value;

          const response = await fetch('/api/register_student', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: name,
                  roll: roll,
                  course: course,
                  images: { center: capturedImageData }
              })
          });

          const result = await response.json();
          if (response.ok) {
              showSuccess('Registration successful! Please sign in.');
              setTimeout(() => {
                  toggleAuthMode(); // Switch to sign in
              }, 1500);
          } else {
              showError(result.message || 'Registration failed');
          }

      } else {
          // Sign In (Identify)
          const response = await fetch('/api/identify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  image: capturedImageData
              })
          });

          const result = await response.json();
          if (response.ok && result.status === 'success') {
              showSuccess(result.message);
              
              // Store user data in sessionStorage
              if (result.data) {
                  sessionStorage.setItem('studentData', JSON.stringify(result.data));
              }
              
              // Redirect to student dashboard
              setTimeout(() => {
                  window.location.href = '/WebPage/Student page/studentdashboard.html';
              }, 1000);
          } else {
              showError(result.message || 'Login failed');
          }
      }
  } catch (error) {
      console.error('Error:', error);
      showError('An error occurred. Please try again.');
  } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
  }
}

// Handle Google Sign In
function handleGoogleSignIn() {
  console.log('Google Sign In clicked');
  alert('Google Sign In clicked!');
}

// Create floating particles
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(particle);
  }
}

// Initialize the form in sign-in mode
function initializeForm() {
  // Ensure correct initial state
  isSignUp = true; // Set to true temporarily so toggleAuthMode switches to Sign In
  toggleAuthMode();
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', () => {
  initializeForm();
  initCamera();
  createParticles();
});

// ❄️ FrostByte Snow Easter Egg
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("frostbyte-logo");
  if (!logo) return;

  logo.addEventListener("click", () => {
    createSnowfall();
  });
});

function createSnowfall() {
  const snowCount = 40;

  for (let i = 0; i < snowCount; i++) {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.textContent = "❄";

    const size = Math.random() * 10 + 12;
    const left = Math.random() * window.innerWidth;
    const duration = Math.random() * 3 + 3;
    const drift = (Math.random() - 0.5) * 100;

    snowflake.style.left = `${left}px`;
    snowflake.style.fontSize = `${size}px`;
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.setProperty("--drift", `${drift}px`);

    document.body.appendChild(snowflake);

    setTimeout(() => {
      snowflake.remove();
    }, duration * 1000);
  }
}