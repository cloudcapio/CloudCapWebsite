document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const cloudFormationDropzone = document.getElementById('cloudFormationDropzone');
    const cloudFormationFile = document.getElementById('cloudFormationFile');
    const cloudFormationFileStatus = document.getElementById('cloudFormationFileStatus');
    const loadingState = document.getElementById('loadingState');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, highlightCloudFormation, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        cloudFormationDropzone.addEventListener(eventName, unhighlightCloudFormation, false);
    });

    // Handle dropped files
    cloudFormationDropzone.addEventListener('drop', handleCloudFormationDrop, false);

    // Handle file selection via click
    cloudFormationDropzone.addEventListener('click', function () {
        cloudFormationFile.click();
    });

    // Handle file selection via input element
    cloudFormationFile.addEventListener('change', handleCloudFormationFileSelect, false);

    let estimateTemplateData;
    let cloudFormationData;

    uploadForm.addEventListener('submit', function (event) {
        event.preventDefault();
      
        // Perform client-side validation
        const cloudFormationFiles = cloudFormationFile.files;
      
        if (cloudFormationFiles.length === 0) {
          // Use the default CloudFormation template if no file is selected
          cloudFormationData = document.getElementById('defaultTemplate').value;
          hideCloudFormationDropzone();
          showDefaultTemplate();
        } else if (cloudFormationFiles.length === 1) {
          const file = cloudFormationFiles[0];
          let readerCfn = new FileReader();
          readerCfn.readAsText(file);
          readerCfn.onload = function () {
            cloudFormationData = readerCfn.result;
          };
        } else {
          alert('Please provide a single CloudFormation file or use the default template.');
          return;
        }
      
        const payload = { 'cfn_template': cloudFormationData, 'generateEstimatesTemplate': 1 };
        // Show loading state
        genTempalateState.style.display = 'block';
        console.log(payload);
      
        // Send POST request to API Gateway
        fetch('https://s99cj4ct84.execute-api.us-east-2.amazonaws.com/call', {
          method: 'POST',
          body: JSON.stringify(payload),
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            estimateTemplateData = data.result;
            const dynamicContainer = document.getElementById('dynamicInputs');
      
            // Looping through each key to create inputs
            for (const key in estimateTemplateData) {
              console.log(key);
              createInputs(dynamicContainer, key, estimateTemplateData[key].NREQUESTS);
            }
            analyzeButton.style.display = 'block';
          })
          .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during the analysis.');
          })
          .finally(() => {
            // Hide loading state
            genTempalateState.style.display = 'none';
          });
      });

    
    analyzeButton.addEventListener('click', function () {

        const payload = { 'cfn_template': cloudFormationData, 'estimates': jsyaml.dump(collectEstimateValues()) };
        // Show loading state
        loadingState.style.display = 'block';
        console.log(payload);
        //
        // Send POST request to API Gateway
        fetch('https://s99cj4ct84.execute-api.us-east-2.amazonaws.com/call', {
            method: 'POST',
            body: JSON.stringify(payload),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Handle the response from API Gateway
                const responseDataElement = document.getElementById('responseData');
                if (data.result === 'PASS') {
                  responseDataElement.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 p-4 rounded-md text-center">
                      <h2 class="text-xl font-bold mb-2">Analysis Result</h2>
                      <p>Your estimation is inline with your infrastructure!</p>
                    </div>
                  `;
                } else if (data.result === 'REJECT') {
                  responseDataElement.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md text-center">
                      <h2 class="text-xl font-bold mb-2">Analysis Result</h2>
                      <p>There is an issue with your estimation and infrastructure</p>
                    </div>
                  `;
                } else {
                  responseDataElement.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md text-center">
                      <h2 class="text-xl font-bold mb-2">Analysis Result</h2>
                      <p>There is an issue with your estimation and infrastructure</p>
                    </div>
                  `;
                }
                responseDataElement.scrollIntoView({ behavior: 'smooth' });
                // Hide the Stage 2 loading state
                loadingState.style.display = 'none';
              })
    });

    function collectEstimateValues() {
        let requestData = {};
        for (const key in estimateTemplateData) {
            const inputGroup = document.getElementById(key + '-input-group');
            const numberInput = inputGroup.querySelector('input[type="number"]');
            requestData[key] = { "nrequests": parseInt(numberInput.value) };
        }
        return requestData
    }
    // Function to create inputs using Tailwind CSS and custom styles for the slider
    function createInputs(container, name, value) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'mb-4 p-2 bg-gray-100 rounded-lg'; // Tailwind classes for spacing and styling
        groupDiv.id = name + '-input-group'; // Assign an ID to each group

        const label = document.createElement('label');
        label.textContent = name + ' Requests: ';
        label.className = 'block text-sm font-medium text-gray-700'; // Tailwind classes for labels
        groupDiv.appendChild(label);

        const numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.className = 'mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'; // Tailwind classes for number input
        numberInput.min = 0;
        numberInput.max = 1000000;
        numberInput.value = value;
        numberInput.oninput = function () {
            rangeInput.value = numberInput.value;
            updateSliderBackground(rangeInput); // Update slider background as the value changes
        };
        groupDiv.appendChild(numberInput);

        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.className = 'mt-1 block w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-thumb'; // Tailwind classes and custom class for range input
        rangeInput.style = `background: linear-gradient(to right, #4f46e5 0%, #4f46e5 ${value / 10000}%, #e5e7eb ${value / 10000}%, #e5e7eb 100%)`; // Initial gradient background
        rangeInput.min = 0;
        rangeInput.max = 1000000;
        rangeInput.value = value;
        rangeInput.oninput = function () {
            numberInput.value = rangeInput.value;
            updateSliderBackground(rangeInput); // Update slider background as the slider moves
        };
        groupDiv.appendChild(rangeInput);

        container.appendChild(groupDiv);
    }

    // Function to update slider background based on its value
    function updateSliderBackground(slider) {
        const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        slider.style.background = `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    }

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
    
    function hideCloudFormationDropzone() {
        const cloudFormationDropzoneContainer = document.querySelector('div[class*="mb-6"]');
        cloudFormationDropzoneContainer.style.display = 'none';
      }

    function handleCloudFormationDrop(event) {
        const dt = event.dataTransfer;
        const files = dt.files;
        cloudFormationFile.files = files;
        handleFiles(files, cloudFormationFileStatus);
        hideDefaultTemplate();
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
        hideDefaultTemplate();
    }

    function handleCostEstimationFileSelect(event) {
        const files = event.target.files;
        handleFiles(files, costEstimationFileStatus);
    }

    function hideDefaultTemplate() {
        const defaultTemplateElement = document.getElementById('defaultTemplate');
        const defaultTemplateLabelElement = document.querySelector('label[for="defaultTemplate"]');
        defaultTemplateElement.style.display = 'none';
        defaultTemplateLabelElement.style.display = 'none';
      }

    function showDefaultTemplate() {
        const defaultTemplateElement = document.getElementById('defaultTemplate');
        const defaultTemplateLabelElement = document.querySelector('label[for="defaultTemplate"]');
        defaultTemplateElement.style.display = 'block';
        defaultTemplateLabelElement.style.display = 'block';
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