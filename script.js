// Fullscreen functionality
document.addEventListener("DOMContentLoaded", function () {
  // 3D Model Viewer
  let scene, camera, renderer, model, controls;
  const modelContainer = document.getElementById("model-container");
  const modelLoader = document.getElementById("model-loader");
  const interactionHint = document.getElementById("interaction-hint");
  const zoomHint = document.getElementById("zoom-hint");
  const fallbackImage = document.getElementById("main-image");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const zoomInBtn = document.querySelector(".fa-search-plus").parentElement;
  const zoomOutBtn = document.querySelector(".fa-search-minus").parentElement;
  const chevronUpBtn = document.querySelector(".fa-chevron-up").parentElement;
  const chevronDownBtn = document.querySelector(".fa-chevron-down").parentElement;

  // Animation state
  let isDemoMode = false;
  let demoRotation = 0;
  let initialRotation = 0;
  let initialCameraZ = 0;
  let isZoomDemo = false;
  let zoomDemo = 0;
  let isReturningToInitial = false;
  let returnProgress = 0;
  let returnStartRotation = 0;
  let returnStartCameraZ = 0;

  function init3DViewer() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f8f8);

    // Camera setup
    const containerWidth = modelContainer.clientWidth;
    const containerHeight = modelContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(
      50,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    modelContainer.appendChild(renderer.domElement);

    // Simple lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI - Math.PI / 6;

    // Stop demo when user starts interacting
    controls.addEventListener("start", function () {
      if (isDemoMode || isZoomDemo || isReturningToInitial) {
        isDemoMode = false;
        isZoomDemo = false;
        isReturningToInitial = false;

        // Hide all hints
        if (interactionHint) {
          interactionHint.classList.remove("show");
          interactionHint.style.display = "none";
        }
        if (zoomHint) {
          zoomHint.classList.remove("show");
          zoomHint.style.display = "none";
        }

        // Remove all highlights
        if (prevBtn && nextBtn && chevronUpBtn && chevronDownBtn) {
          prevBtn.classList.remove("highlight-icon");
          nextBtn.classList.remove("highlight-icon");
          chevronUpBtn.classList.remove("highlight-icon");
          chevronDownBtn.classList.remove("highlight-icon");
        }
        if (zoomInBtn && zoomOutBtn) {
          zoomInBtn.classList.remove("highlight-icon");
          zoomOutBtn.classList.remove("highlight-icon");
        }

        // Return to initial positions immediately when user interacts
        if (model) {
          model.rotation.y = initialRotation;
        }
        if (camera) {
          camera.position.z = initialCameraZ;
        }
      }
    });

    // Load 3D model
    loadHeadphonesModel();
  }

  function loadHeadphonesModel() {
    const loader = new THREE.GLTFLoader();

    // Load the iPhone model from the local models folder
    const modelUrl = "./models/iPhone13.glb";

    loader.load(
      modelUrl,
      function (gltf) {
        // Successfully loaded model
        model = gltf.scene;

        // Scale and position the iPhone model appropriately
        model.scale.set(15, 15, 15); // Much larger scale for better visibility
        model.position.set(0, -0.1, 0);

        // Add the model to the scene
        scene.add(model);

        // Hide loader and show model
        modelLoader.style.display = "none";
        renderer.domElement.style.display = "block";

        // Store initial camera position
        initialCameraZ = camera.position.z;

        // Start demo animation sequence
        startDemoAnimationSequence();

        // Start animation loop
        animate();
      },
      function (progress) {
        // Loading progress
        console.log(
          "Loading progress:",
          (progress.loaded / progress.total) * 100 + "%"
        );
      },
      function (error) {
        // Loading failed, fallback to our custom headphones model
        console.warn("Failed to load iPhone model, using fallback:", error);
        createSimpleHeadphones();
      }
    );
  }

  function createSimpleHeadphones() {
    // Create a professional-looking headphones model
    const group = new THREE.Group();

    // Main headband - more realistic curved design
    const headbandGeometry = new THREE.TorusGeometry(
      2.2,
      0.06,
      8,
      24,
      Math.PI * 0.85
    );
    const headbandMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,
      shininess: 80,
      specular: 0x222222,
    });
    const headband = new THREE.Mesh(headbandGeometry, headbandMaterial);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 0.4;
    group.add(headband);

    // Headband inner padding
    const innerPaddingGeometry = new THREE.TorusGeometry(
      2.2,
      0.08,
      8,
      24,
      Math.PI * 0.85
    );
    const innerPaddingMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      shininess: 10,
    });
    const innerPadding = new THREE.Mesh(
      innerPaddingGeometry,
      innerPaddingMaterial
    );
    innerPadding.rotation.x = Math.PI / 2;
    innerPadding.position.y = 0.4;
    group.add(innerPadding);

    // Headband outer padding
    const outerPaddingGeometry = new THREE.TorusGeometry(
      2.2,
      0.12,
      8,
      24,
      Math.PI * 0.85
    );
    const outerPaddingMaterial = new THREE.MeshPhongMaterial({
      color: 0x404040,
      shininess: 20,
    });
    const outerPadding = new THREE.Mesh(
      outerPaddingGeometry,
      outerPaddingMaterial
    );
    outerPadding.rotation.x = Math.PI / 2;
    outerPadding.position.y = 0.4;
    group.add(outerPadding);

    // Left earcup - more realistic proportions
    const leftEarcupGeometry = new THREE.CylinderGeometry(0.6, 0.55, 0.3, 20);
    const leftEarcupMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,
      shininess: 60,
      specular: 0x333333,
    });
    const leftEarcup = new THREE.Mesh(leftEarcupGeometry, leftEarcupMaterial);
    leftEarcup.position.set(-1.6, -0.8, 0);
    leftEarcup.rotation.z = Math.PI / 2;
    group.add(leftEarcup);

    // Right earcup
    const rightEarcupGeometry = new THREE.CylinderGeometry(0.6, 0.55, 0.3, 20);
    const rightEarcupMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,
      shininess: 60,
      specular: 0x333333,
    });
    const rightEarcup = new THREE.Mesh(
      rightEarcupGeometry,
      rightEarcupMaterial
    );
    rightEarcup.position.set(1.6, -0.8, 0);
    rightEarcup.rotation.z = Math.PI / 2;
    group.add(rightEarcup);

    // Left ear cushion - thicker and more realistic
    const leftCushionGeometry = new THREE.CylinderGeometry(
      0.52,
      0.52,
      0.12,
      20
    );
    const leftCushionMaterial = new THREE.MeshPhongMaterial({
      color: 0x0d0d0d,
      shininess: 5,
      roughness: 0.8,
    });
    const leftCushion = new THREE.Mesh(
      leftCushionGeometry,
      leftCushionMaterial
    );
    leftCushion.position.set(-1.6, -0.8, 0.18);
    leftCushion.rotation.z = Math.PI / 2;
    group.add(leftCushion);

    // Right ear cushion
    const rightCushionGeometry = new THREE.CylinderGeometry(
      0.52,
      0.52,
      0.12,
      20
    );
    const rightCushionMaterial = new THREE.MeshPhongMaterial({
      color: 0x0d0d0d,
      shininess: 5,
      roughness: 0.8,
    });
    const rightCushion = new THREE.Mesh(
      rightCushionGeometry,
      rightCushionMaterial
    );
    rightCushion.position.set(1.6, -0.8, 0.18);
    rightCushion.rotation.z = Math.PI / 2;
    group.add(rightCushion);

    // Left speaker grille
    const leftGrilleGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 16);
    const leftGrilleMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 40,
    });
    const leftGrille = new THREE.Mesh(leftGrilleGeometry, leftGrilleMaterial);
    leftGrille.position.set(-1.6, -0.8, 0.25);
    leftGrille.rotation.z = Math.PI / 2;
    group.add(leftGrille);

    // Right speaker grille
    const rightGrilleGeometry = new THREE.CylinderGeometry(
      0.35,
      0.35,
      0.02,
      16
    );
    const rightGrilleMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 40,
    });
    const rightGrille = new THREE.Mesh(
      rightGrilleGeometry,
      rightGrilleMaterial
    );
    rightGrille.position.set(1.6, -0.8, 0.25);
    rightGrille.rotation.z = Math.PI / 2;
    group.add(rightGrille);

    // Mic boom - more realistic
    const micGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.8, 8);
    const micMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      shininess: 60,
    });
    const mic = new THREE.Mesh(micGeometry, micMaterial);
    mic.position.set(-1.2, -0.3, 0.4);
    mic.rotation.x = Math.PI / 8;
    group.add(mic);

    // Mic head - more detailed
    const micHeadGeometry = new THREE.SphereGeometry(0.035, 12, 12);
    const micHeadMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      shininess: 80,
    });
    const micHead = new THREE.Mesh(micHeadGeometry, micHeadMaterial);
    micHead.position.set(-0.8, 0.1, 0.7);
    group.add(micHead);

    // Volume controls - more realistic
    const controlGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.015, 12);
    const controlMaterial = new THREE.MeshPhongMaterial({
      color: 0x555555,
      shininess: 50,
    });

    const control1 = new THREE.Mesh(controlGeometry, controlMaterial);
    control1.position.set(1.6, -0.4, 0.12);
    control1.rotation.z = Math.PI / 2;
    group.add(control1);

    const control2 = new THREE.Mesh(controlGeometry, controlMaterial);
    control2.position.set(1.6, -0.55, 0.12);
    control2.rotation.z = Math.PI / 2;
    group.add(control2);

    // Power button
    const powerButtonGeometry = new THREE.CylinderGeometry(
      0.04,
      0.04,
      0.01,
      12
    );
    const powerButtonMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 60,
    });
    const powerButton = new THREE.Mesh(
      powerButtonGeometry,
      powerButtonMaterial
    );
    powerButton.position.set(1.6, -0.7, 0.12);
    powerButton.rotation.z = Math.PI / 2;
    group.add(powerButton);

    // LED indicator
    const ledGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const ledMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      emissive: 0x004400,
      shininess: 100,
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(1.6, -0.7, 0.16);
    group.add(led);

    // Scale the entire model to fit better
    group.scale.set(0.7, 0.7, 0.7);

    model = group;
    scene.add(model);

    // Hide loader and show model
    modelLoader.style.display = "none";
    renderer.domElement.style.display = "block";

    // Store initial camera position
    initialCameraZ = camera.position.z;

    // Start demo animation sequence
    startDemoAnimationSequence();

    // Start animation loop
    animate();
  }

  function startDemoAnimationSequence() {
    // Store initial rotation
    if (model) {
      initialRotation = model.rotation.y;
    }

    // Step 1: Model appears and stays still for 1 second
    setTimeout(() => {
      // Step 2: Show drag hint and start rotation
      if (interactionHint) {
        interactionHint.classList.add("show");
        // Highlight chevron icons
        if (prevBtn && nextBtn && chevronUpBtn && chevronDownBtn) {
          prevBtn.classList.add("highlight-icon");
          nextBtn.classList.add("highlight-icon");
          chevronUpBtn.classList.add("highlight-icon");
          chevronDownBtn.classList.add("highlight-icon");
        }
      }

      isDemoMode = true;
      demoRotation = 0;

      // Step 3: After 2 seconds, hide drag hint and show zoom hint
      setTimeout(() => {
        if (interactionHint) {
          interactionHint.classList.remove("show");
          interactionHint.style.display = "none";
          // Remove highlight from chevron icons
          if (prevBtn && nextBtn && chevronUpBtn && chevronDownBtn) {
            prevBtn.classList.remove("highlight-icon");
            nextBtn.classList.remove("highlight-icon");
            chevronUpBtn.classList.remove("highlight-icon");
            chevronDownBtn.classList.remove("highlight-icon");
          }
        }

        // Show zoom hint and start zoom demo
        if (zoomHint) {
          zoomHint.classList.add("show");
          // Highlight zoom icons
          if (zoomInBtn && zoomOutBtn) {
            zoomInBtn.classList.add("highlight-icon");
            zoomOutBtn.classList.add("highlight-icon");
          }
        }

        isDemoMode = false;
        isZoomDemo = true;
        zoomDemo = 0;

        // Step 4: After 2 seconds, hide zoom hint and smoothly return to initial position
        setTimeout(() => {
          if (zoomHint) {
            zoomHint.classList.remove("show");
            zoomHint.style.display = "none";
            // Remove highlight from zoom icons
            if (zoomInBtn && zoomOutBtn) {
              zoomInBtn.classList.remove("highlight-icon");
              zoomOutBtn.classList.remove("highlight-icon");
            }
          }

          isZoomDemo = false;

          // Start smooth return to initial position
          startSmoothReturn();
        }, 2000);
      }, 2000);
    }, 1000);
  }

  function startSmoothReturn() {
    // Store current positions as starting points for interpolation
    if (model) {
      returnStartRotation = model.rotation.y;
    }
    if (camera) {
      returnStartCameraZ = camera.position.z;
    }

    // Start smooth return animation
    isReturningToInitial = true;
    returnProgress = 0;
  }

  function animate() {
    requestAnimationFrame(animate);

    if (controls) {
      controls.update();
    }

    // Demo rotation animation - half rotation
    if (isDemoMode && model) {
      demoRotation += 0.015;
      // Rotate from initial position to half rotation (π radians = 180 degrees)
      if (demoRotation <= Math.PI) {
        model.rotation.y = initialRotation + demoRotation;
      }
    }

    // Demo zoom animation - zoom in then out
    if (isZoomDemo && camera) {
      zoomDemo += 0.02;
      // Zoom in for first half, zoom out for second half
      if (zoomDemo <= Math.PI) {
        // Zoom in
        camera.position.z = initialCameraZ - Math.sin(zoomDemo) * 2;
      } else {
        // Zoom out
        const outProgress = (zoomDemo - Math.PI) / Math.PI;
        camera.position.z =
          initialCameraZ - Math.sin(Math.PI - outProgress * Math.PI) * 2;
      }
    }

    // Smooth return to initial position
    if (isReturningToInitial) {
      returnProgress += 0.02; // Animation speed

      if (returnProgress <= 1) {
        // Use ease-out interpolation for smooth transition
        const easeOut = 1 - Math.pow(1 - returnProgress, 3);

        // Interpolate rotation
        if (model) {
          model.rotation.y =
            returnStartRotation +
            (initialRotation - returnStartRotation) * easeOut;
        }

        // Interpolate camera position
        if (camera) {
          camera.position.z =
            returnStartCameraZ +
            (initialCameraZ - returnStartCameraZ) * easeOut;
        }
      } else {
        // Animation complete
        isReturningToInitial = false;

        // Ensure exact final positions
        if (model) {
          model.rotation.y = initialRotation;
        }
        if (camera) {
          camera.position.z = initialCameraZ;
        }
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  function handleResize() {
    if (renderer && camera && modelContainer) {
      const width = modelContainer.clientWidth;
      const height = modelContainer.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }

  // Initialize 3D viewer
  if (modelContainer) {
    init3DViewer();
    window.addEventListener("resize", handleResize);
  }

  // Image loading handler for fallback images
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("load", function () {
      this.classList.add("loaded");
    });

    img.addEventListener("error", function () {
      this.style.opacity = "0.5";
      console.warn("Failed to load image:", this.src);
    });

    // If image is already loaded
    if (img.complete) {
      img.classList.add("loaded");
    }
  });

  const fullscreenBtn = document.getElementById("fullscreen-btn");
  const body = document.body;

  // Check if fullscreen is supported
  if (
    !document.fullscreenEnabled &&
    !document.webkitFullscreenEnabled &&
    !document.mozFullScreenEnabled &&
    !document.msFullscreenEnabled
  ) {
    fullscreenBtn.textContent = "Fullscreen not supported";
    fullscreenBtn.disabled = true;
    return;
  }

  // Toggle fullscreen function
  function toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement
    ) {
      // Enter fullscreen
      if (body.requestFullscreen) {
        body.requestFullscreen();
      } else if (body.webkitRequestFullscreen) {
        body.webkitRequestFullscreen();
      } else if (body.mozRequestFullScreen) {
        body.mozRequestFullScreen();
      } else if (body.msRequestFullscreen) {
        body.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  // Event listener for fullscreen button
  fullscreenBtn.addEventListener("click", toggleFullscreen);

  // Handle fullscreen change events
  function handleFullscreenChange() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      // In fullscreen
      body.classList.add("fullscreen");
      fullscreenBtn.textContent = "Exit Fullscreen";
    } else {
      // Not in fullscreen
      body.classList.remove("fullscreen");
      fullscreenBtn.textContent = "Enter Fullscreen";
    }
  }

  // Listen for fullscreen changes
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  // Add some interactive animations
  const container = document.querySelector(".container");

  container.addEventListener("mouseenter", function () {
    this.style.transform = "scale(1.05)";
  });

  container.addEventListener("mouseleave", function () {
    this.style.transform = "scale(1)";
  });

  // Add keyboard shortcut (F key for fullscreen)
  document.addEventListener("keydown", function (event) {
    if (
      event.key.toLowerCase() === "f" &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      toggleFullscreen();
    }
  });

  console.log("Fullscreen prototype loaded successfully!");
});

// Color selection functionality (simplified - no 3D model color change)
const colorOptions = document.querySelectorAll(".color-option");
colorOptions.forEach((option) => {
  option.addEventListener("click", function () {
    colorOptions.forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");

    // Update fallback image based on color selection
    const mainImage = document.getElementById("main-image");
    const colorMap = {
      black: "iPhone+13+Black",
      white: "iPhone+13+White",
      blue: "iPhone+13+Blue",
      red: "iPhone+13+Red",
    };
    const color = this.dataset.color;
    mainImage.src = `https://placehold.co/500x500/e5e5e5/333333?text=${colorMap[color]}`;
  });
});

// Size selection functionality
const sizeOptions = document.querySelectorAll(".size-option");
sizeOptions.forEach((option) => {
  option.addEventListener("click", function () {
    sizeOptions.forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");
  });
});

// Quantity selector functionality
const qtyInput = document.querySelector(".qty-input");
const minusBtn = document.querySelector(".qty-btn.minus");
const plusBtn = document.querySelector(".qty-btn.plus");

minusBtn.addEventListener("click", function () {
  const currentValue = parseInt(qtyInput.value);
  if (currentValue > 1) {
    qtyInput.value = currentValue - 1;
  }
});

plusBtn.addEventListener("click", function () {
  const currentValue = parseInt(qtyInput.value);
  if (currentValue < 10) {
    qtyInput.value = currentValue + 1;
  }
});

// Thumbnail gallery functionality
const thumbnails = document.querySelectorAll(".thumbnail");
const mainImage = document.getElementById("main-image");

thumbnails.forEach((thumbnail, index) => {
  thumbnail.addEventListener("click", function () {
    thumbnails.forEach((thumb) => thumb.classList.remove("active"));
    this.classList.add("active");

    // Update main image
    const imageMap = {
      0: "https://placehold.co/500x500/e5e5e5/333333?text=Premium+Wireless+Headphones",
      1: "https://placehold.co/500x500/f0f0f0/666666?text=Side+View",
      2: "https://placehold.co/500x500/e8e8e8/999999?text=Video+Preview",
      3: "https://placehold.co/500x500/e5f3ff/4285f4?text=Blue+Version",
      4: "https://placehold.co/500x500/f5f5f5/333333?text=Detail+View",
    };

    if (imageMap[index]) {
      mainImage.src = imageMap[index];
    }
  });
});

// Gallery navigation
const prevThumb = document.querySelector(".prev-thumb");
const nextThumb = document.querySelector(".next-thumb");
const thumbnailsContainer = document.querySelector(".thumbnails");

prevThumb.addEventListener("click", function () {
  thumbnailsContainer.scrollBy({ left: -100, behavior: "smooth" });
});

nextThumb.addEventListener("click", function () {
  thumbnailsContainer.scrollBy({ left: 100, behavior: "smooth" });
});

// Add to cart functionality
const addToCartBtn = document.querySelector(".add-to-cart-btn");
addToCartBtn.addEventListener("click", function () {
  // Add loading state
  const originalText = this.textContent;
  this.textContent = "Adding...";
  this.disabled = true;

  // Simulate API call
  setTimeout(() => {
    this.textContent = "Added to Cart!";
    this.style.backgroundColor = "#4caf50";

    setTimeout(() => {
      this.textContent = originalText;
      this.style.backgroundColor = "#4285f4";
      this.disabled = false;
    }, 2000);
  }, 1000);
});

// Wishlist functionality
const wishlistBtn = document.querySelector(".wishlist-btn");
wishlistBtn.addEventListener("click", function () {
  const icon = this.querySelector("i");
  if (icon.classList.contains("far")) {
    icon.classList.remove("far");
    icon.classList.add("fas");
    this.style.color = "#ff4444";
    this.style.borderColor = "#ff4444";
  } else {
    icon.classList.remove("fas");
    icon.classList.add("far");
    this.style.color = "#666666";
    this.style.borderColor = "#e5e5e5";
  }
});

// Image zoom functionality
const zoomBtn = document.querySelector(".zoom-btn");
zoomBtn.addEventListener("click", function () {
  const mainImageContainer = document.querySelector(".main-image-container");
  if (mainImageContainer.classList.contains("zoomed")) {
    mainImageContainer.classList.remove("zoomed");
    this.innerHTML = '<i class="fas fa-expand"></i>';
    // Reset 3D model camera
    if (camera) {
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
    }
  } else {
    mainImageContainer.classList.add("zoomed");
    this.innerHTML = '<i class="fas fa-compress"></i>';
    // Zoom 3D model camera
    if (camera) {
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
    }
  }
});

// Image control buttons
const controlBtns = document.querySelectorAll(".control-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

controlBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Add visual feedback
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "scale(1)";
    }, 150);

    // Handle specific control actions
    if (this === prevBtn && model) {
      // Rotate model left
      model.rotation.y -= Math.PI / 4;
    } else if (this === nextBtn && model) {
      // Rotate model right
      model.rotation.y += Math.PI / 4;
    } else if (this.querySelector(".fa-search-plus") && model) {
      // Zoom in
      if (camera) {
        camera.position.z = Math.max(2, camera.position.z - 0.5);
      }
    } else if (this.querySelector(".fa-search-minus") && model) {
      // Zoom out
      if (camera) {
        camera.position.z = Math.min(8, camera.position.z + 0.5);
      }
    }
  });
});

// Header icon interactions
const iconBtns = document.querySelectorAll(".icon-btn");
iconBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Add ripple effect
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "scale(1)";
    }, 150);
  });
});

// Smooth scrolling for thumbnail gallery
let isScrolling = false;
thumbnailsContainer.addEventListener("scroll", function () {
  if (!isScrolling) {
    window.requestAnimationFrame(function () {
      // Update navigation button states based on scroll position
      const scrollLeft = thumbnailsContainer.scrollLeft;
      const maxScroll =
        thumbnailsContainer.scrollWidth - thumbnailsContainer.clientWidth;

      prevThumb.style.opacity = scrollLeft > 0 ? "1" : "0.5";
      nextThumb.style.opacity = scrollLeft < maxScroll ? "1" : "0.5";

      isScrolling = false;
    });
  }
  isScrolling = true;
});

// Initialize navigation button states
const maxScroll =
  thumbnailsContainer.scrollWidth - thumbnailsContainer.clientWidth;
prevThumb.style.opacity = "0.5";
nextThumb.style.opacity = maxScroll > 0 ? "1" : "0.5";

// Add keyboard navigation
document.addEventListener("keydown", function (event) {
  if (event.target.tagName === "INPUT") return;

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      const currentActive = document.querySelector(".thumbnail.active");
      const prevThumbnail = currentActive.previousElementSibling;
      if (prevThumbnail && prevThumbnail.classList.contains("thumbnail")) {
        prevThumbnail.click();
      }
      break;
    case "ArrowRight":
      event.preventDefault();
      const currentActiveRight = document.querySelector(".thumbnail.active");
      const nextThumbnail = currentActiveRight.nextElementSibling;
      if (nextThumbnail && nextThumbnail.classList.contains("thumbnail")) {
        nextThumbnail.click();
      }
      break;
    case "+":
    case "=":
      event.preventDefault();
      plusBtn.click();
      break;
    case "-":
      event.preventDefault();
      minusBtn.click();
      break;
  }
});

console.log("E-commerce product page loaded successfully!");
