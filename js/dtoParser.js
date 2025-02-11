// DTO Parser and Validator
class DtoParser {
    constructor() {
        this.dtoInput = document.getElementById('dtoPasteInput');
        this.parseButton = document.getElementById('parseDtoBtn');
        this.validationMessage = document.getElementById('dtoValidationMessage');
        this.dtoFieldsContainer = document.getElementById('dtoFieldsContainer');
        this.generateButton = document.getElementById('generateCodeBtn');
        this.parsedFields = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.parseButton.addEventListener('click', () => this.parseDto());
        // Add event listener for the generate button
        this.generateButton.addEventListener('click', () => this.handleGenerate());
    }

    parseDto() {
        const dtoCode = this.dtoInput.value.trim();
        if (!dtoCode) {
            this.showValidationError('Please paste your DTO code first.');
            return;
        }

        try {
            const dtoFields = this.extractDtoFields(dtoCode);
            if (dtoFields.length === 0) {
                this.showValidationError('No valid properties found in the DTO.');
                return;
            }

            // Clear existing fields
            this.dtoFieldsContainer.innerHTML = '';
            
            // Store parsed fields
            this.parsedFields = dtoFields;
            
            // Add extracted fields to the form
            dtoFields.forEach(field => this.addFieldToForm(field));
            
            this.showValidationSuccess('DTO parsed successfully!');
        } catch (error) {
            this.showValidationError(error.message);
        }
    }

    extractDtoFields(dtoCode) {
        // Basic validation of class structure
        if (!dtoCode.includes('class') || !dtoCode.includes('{')) {
            throw new Error('Invalid DTO format. Must be a C# class.');
        }

        const fields = [];
        const lines = dtoCode.split('\n');
        
        // Regular expression for property pattern with improved type matching
        const propertyPattern = /public\s+([a-zA-Z0-9<>,.?\[\]]+)\s+([a-zA-Z0-9]+)\s*{\s*get;\s*set;\s*}/;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            const match = trimmedLine.match(propertyPattern);
            
            if (match) {
                fields.push({
                    type: match[1],
                    name: match[2]
                });
            }
        }

        return fields;
    }

    addFieldToForm(field) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'flex space-x-2 items-center';
        fieldDiv.innerHTML = `
            <input type="text" value="${field.name}" class="border p-2 flex-1 rounded" readonly />
            <input type="text" value="${field.type}" class="border p-2 flex-1 rounded" readonly />
            <button class="text-red-500 hover:text-red-700" onclick="this.parentElement.remove()">×</button>
        `;
        this.dtoFieldsContainer.appendChild(fieldDiv);
    }

    handleGenerate() {
        const pattern = document.getElementById('patternSelect').value;
        const httpMethod = document.getElementById('httpMethodSelect').value;
        const entityName = document.getElementById('entityNameInput').value;
        
        if (!entityName) {
            this.showValidationError('Please enter an entity name.');
            return;
        }

        if (this.parsedFields.length === 0) {
            this.showValidationError('Please parse a DTO or add fields first.');
            return;
        }

        // Create configuration object
        const config = {
            pattern,
            httpMethod,
            entityName,
            dtoFields: this.parsedFields,
            namespace: document.getElementById('namespaceInput')?.value || 'YourNamespace',
            useAuthorization: document.getElementById('useAuthorization')?.checked || false,
            useValidation: document.getElementById('useValidation')?.checked || false
        };

        // Dispatch custom event with configuration
        const event = new CustomEvent('generateCode', { detail: config });
        document.dispatchEvent(event);
    }

    showValidationError(message) {
        this.validationMessage.textContent = message;
        this.validationMessage.className = 'text-sm text-red-500';
    }

    showValidationSuccess(message) {
        this.validationMessage.textContent = message;
        this.validationMessage.className = 'text-sm text-green-500';
    }

    // Method to get current fields (can be used by other modules)
    getFields() {
        return this.parsedFields;
    }
}

// Initialize the DTO parser when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dtoParser = new DtoParser();
}); 