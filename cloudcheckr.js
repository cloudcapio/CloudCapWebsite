document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const cloudFormationDropzone = document.getElementById('cloudFormationDropzone');
    const costEstimationDropzone = document.getElementById('costEstimationDropzone');
    const cloudFormationFile = document.getElementById('cloudFormationFile');
    const costEstimationFile = document.getElementById('costEstimationFile');
    const cloudFormationFileStatus = document.getElementById('cloudFormationFileStatus');
    const costEstimationFileStatus = document.getElementById('costEstimationFileStatus');
    const loadingState = document.getElementById('loadingState');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, preventDefaults, false);
        costEstimationDropzone.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, highlightCloudFormation, false);
        costEstimationDropzone.addEventListener(eventName, highlightCostEstimation, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, unhighlightCloudFormation, false);
        costEstimationDropzone.addEventListener(eventName, unhighlightCostEstimation, false);
    });

    // Handle dropped files
    cloudFormationDropzone.addEventListener('drop', handleCloudFormationDrop, false);
    costEstimationDropzone.addEventListener('drop', handleCostEstimationDrop, false);

    // Handle file selection via click
    cloudFormationDropzone.addEventListener('click', function() {
        cloudFormationFile.click();
    });
    costEstimationDropzone.addEventListener('click', function() {
        costEstimationFile.click();
    });

    // Handle file selection via input element
    cloudFormationFile.addEventListener('change', handleCloudFormationFileSelect, false);
    costEstimationFile.addEventListener('change', handleCostEstimationFileSelect, false);

    uploadForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Perform client-side validation
        const cloudFormationFiles = cloudFormationFile.files;
        const costEstimationFiles = costEstimationFile.files;

        if (cloudFormationFiles.length !== 1 || costEstimationFiles.length !== 1) {
            alert('Please select both CloudFormation and Cost Estimation files.');
            return;
        }

        // Simulate loading state
        loadingState.style.display = 'block';

        // Simulate file upload and analysis (replace with actual API call)
        setTimeout(function() {
            // Redirect to success page
            window.location.href = 'success.html';
        }, 2000);
    });

    function preventDefaults(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    function highlightCloudFormation() {
        cloudFormationDropzone.classList.add('border-blue-500');
    }

    function unhighlightCloudFormation() {
        cloudFormationDropzone.classList.remove('border-blue-500');
    }

    function highlightCostEstimation() {
        costEstimationDropzone.classList.add('border-blue-500');
    }

    function unhighlightCostEstimation() {
        costEstimationDropzone.classList.remove('border-blue-500');
    }

    function handleCloudFormationDrop(event) {
        const dt = event.dataTransfer;
        const files = dt.files;
        cloudFormationFile.files = files;
        handleFiles(files, cloudFormationFileStatus);
    }

    function handleCostEstimationDrop(event) {
        const dt = event.dataTransfer;
        const files = dt.files;
        costEstimationFile.files = files;
        handleFiles(files, costEstimationFileStatus);
    }

    function handleCloudFormationFileSelect(event) {
        const files = event.target.files;
        handleFiles(files, cloudFormationFileStatus);
    }

    function handleCostEstimationFileSelect(event) {
        const files = event.target.files;
        handleFiles(files, costEstimationFileStatus);
    }

    function handleFiles(files, fileStatus) {
        if (files.length === 1) {
            const file = files[0];
            fileStatus.textContent = `Selected file: ${file.name}`;
            fileStatus.classList.remove('text-red-500');
            fileStatus.classList.add('text-green-500');
        } else {
            fileStatus.textContent = 'Please select a single file';
            fileStatus.classList.remove('text-green-500');
            fileStatus.classList.add('text-red-500');
        }
    }
});