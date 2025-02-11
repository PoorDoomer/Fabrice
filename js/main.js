// DOM Elements
const patternSelect      = document.getElementById('patternSelect');
const httpMethodSelect   = document.getElementById('httpMethodSelect');
const entityNameInput    = document.getElementById('entityNameInput');
const dtoFieldsContainer = document.getElementById('dtoFieldsContainer');
const addFieldBtn        = document.getElementById('addFieldBtn');
const namespaceInput     = document.getElementById('namespaceInput');
const useAuthorization   = document.getElementById('useAuthorization');
const useValidation      = document.getElementById('useValidation');
const generateCodeBtn    = document.getElementById('generateCodeBtn');
const copyCodeBtn        = document.getElementById('copyCodeBtn');
const codePreview        = document.getElementById('codePreview');
const saveConfigBtn      = document.getElementById('saveConfigBtn');
const loadConfigBtn      = document.getElementById('loadConfigBtn');

// Helper to track dynamic DTO fields
let fieldCount = 0;

/**
 * Creates a new field row for DTO properties
 */
const createFieldRow = () => {
  const row = document.createElement('div');
  row.className = 'flex space-x-2';

  // Field name
  const fieldNameInput = document.createElement('input');
  fieldNameInput.type  = 'text';
  fieldNameInput.placeholder = 'Field Name';
  fieldNameInput.className   = 'border p-2 rounded w-1/2';

  // Field type
  const fieldTypeSelect = document.createElement('select');
  fieldTypeSelect.className = 'border p-2 rounded w-1/2';
  const types = ['int', 'string', 'decimal', 'DateTime', 'bool', 'Guid'];
  types.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.text  = t;
    fieldTypeSelect.appendChild(opt);
  });

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.className = 'bg-red-500 text-white px-2 rounded hover:bg-red-600';
  removeBtn.addEventListener('click', () => {
    dtoFieldsContainer.removeChild(row);
  });

  row.appendChild(fieldNameInput);
  row.appendChild(fieldTypeSelect);
  row.appendChild(removeBtn);

  return row;
};

/**
 * Gather configuration from form
 */
function getConfigFromForm() {
  // Collect fields
  const fieldRows = dtoFieldsContainer.querySelectorAll('div.flex');
  const dtoFields = [];
  fieldRows.forEach(row => {
    const inputs = row.querySelectorAll('input, select');
    if (inputs.length >= 2) {
      const name = inputs[0].value.trim();
      const type = inputs[1].value.trim();
      if (name) {
        dtoFields.push({ name, type });
      }
    }
  });

  // Parse dependencies
  const dependenciesInput = document.getElementById('dependenciesInput');
  const dependencies = dependenciesInput.value
    .split('\n')
    .map(dep => dep.trim())
    .filter(dep => dep)
    .map(dep => {
      const parts = dep.split(' ');
      return {
        type: parts.slice(0, -1).join(' ').trim(),
        name: parts[parts.length - 1].trim()
      };
    });

  return {
    pattern: patternSelect.value,
    httpMethod: httpMethodSelect.value,
    entityName: entityNameInput.value.trim(),
    dtoFields,
    namespace: namespaceInput.value.trim() || 'DefaultNamespace',
    authorization: useAuthorization.checked,
    validation: useValidation.checked,
    dependencies
  };
}

// Main application coordinator
class CodeGenerator {
    constructor() {
        this.codePreview = document.getElementById('codePreview');
        this.copyButton = document.getElementById('copyCodeBtn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Listen for generate code events
        document.addEventListener('generateCode', (event) => this.generateCode(event.detail));
        
        // Copy button functionality
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
    }

    generateCode(config) {
        let generatedCode = '';
        
        // Clear existing endpoints
        window.endpointExplorer.clearEndpoints();
        
  switch (config.pattern) {
    case 'cqrs':
                generatedCode = this.generateCQRSCode(config);
      break;
    case 'service':
                generatedCode = this.generateServiceCode(config);
      break;
    case 'simple':
                generatedCode = this.generateSimpleCode(config);
      break;
    default:
                console.error('Unknown pattern:', config.pattern);
                return;
        }

        this.codePreview.textContent = generatedCode;

        // Add endpoint to explorer
        const returnType = config.httpMethod === 'GET' ? `List<${config.entityName}Dto>` : config.entityName + 'Dto';
        window.endpointExplorer.addEndpoint(
            config.httpMethod,
            `/api/${config.entityName.toLowerCase()}`,
            returnType,
            config.authorization
        );
    }

    generateCQRSCode(config) {
        const { entityName, httpMethod, dtoFields, namespace, useAuthorization, useValidation, dependencies } = config;
        
        let code = `using System;\nusing System.Collections.Generic;\nusing System.Threading;\nusing System.Threading.Tasks;\nusing Microsoft.AspNetCore.Mvc;\n`;
        if (useValidation) {
            code += `using System.ComponentModel.DataAnnotations;\n`;
        }
        code += `using MediatR;\n\nnamespace ${namespace}\n{\n`;
        
        if (useAuthorization) {
            code += `    using Microsoft.AspNetCore.Authorization;\n`;
        }

        // Generate DTO
        code += `    public class ${entityName}Dto\n    {\n`;
        dtoFields.forEach(field => {
            if (useValidation) {
                code += `        [Required]\n`;
            }
            code += `        public ${field.type} ${field.name} { get; set; }\n`;
        });
        code += `    }\n\n`;

        // Generate Command/Query
        const commandName = `${entityName}${httpMethod}`;
        code += `    public class ${commandName}Command : IRequest<${entityName}Dto>\n    {\n`;
        dtoFields.forEach(field => {
            code += `        public ${field.type} ${field.name} { get; set; }\n`;
        });
        code += `    }\n\n`;

        // Generate Handler
        code += `    public class ${commandName}Handler : IRequestHandler<${commandName}Command, ${entityName}Dto>\n    {\n`;
        
        // Add handler dependencies
        if (dependencies.length > 0) {
            dependencies.forEach(dep => {
                code += `        private readonly ${dep.type} _${dep.name};\n`;
            });
            code += '\n';
            
            code += `        public ${commandName}Handler(${dependencies.map(d => `${d.type} ${d.name}`).join(', ')})\n        {\n`;
            dependencies.forEach(dep => {
                code += `            _${dep.name} = ${dep.name};\n`;
            });
            code += `        }\n\n`;
        }
        
        code += `        public async Task<${entityName}Dto> Handle(${commandName}Command request, CancellationToken cancellationToken)\n        {\n`;
        code += `            // TODO: Implement your business logic here\n`;
        code += `            throw new NotImplementedException();\n`;
        code += `        }\n    }\n\n`;

        // Generate Controller
        code += `    [ApiController]\n`;
        code += `    [Route("api/[controller]")]\n`;
        if (useAuthorization) {
            code += `    [Authorize]\n`;
        }
        code += `    public class ${entityName}Controller : ControllerBase\n    {\n`;
        code += `        private readonly IMediator _mediator;\n`;
        
        // Add controller dependencies
        if (dependencies.length > 0) {
            dependencies.forEach(dep => {
                code += `        private readonly ${dep.type} _${dep.name};\n`;
            });
        }
        code += '\n';
        
        // Constructor with dependencies
        if (dependencies.length > 0) {
            code += `        public ${entityName}Controller(IMediator mediator, ${dependencies.map(d => `${d.type} ${d.name}`).join(', ')})\n        {\n`;
            code += `            _mediator = mediator;\n`;
            dependencies.forEach(dep => {
                code += `            _${dep.name} = ${dep.name};\n`;
            });
            code += `        }\n\n`;
        } else {
            code += `        public ${entityName}Controller(IMediator mediator)\n        {\n`;
            code += `            _mediator = mediator;\n        }\n\n`;
        }
        
        // Add endpoint
        code += `        [Http${httpMethod}]\n`;
        code += `        public async Task<ActionResult<${entityName}Dto>> ${httpMethod}${entityName}([FromBody] ${commandName}Command command)\n        {\n`;
        code += `            var result = await _mediator.Send(command);\n`;
        code += `            return Ok(result);\n`;
        code += `        }\n    }\n`;
        
        code += `}\n`;
        
        return code;
    }

    generateServiceCode(config) {
        const { entityName, httpMethod, dtoFields, namespace, useAuthorization, useValidation, dependencies } = config;
        
        let code = `using System;\nusing System.Threading.Tasks;\nusing Microsoft.AspNetCore.Mvc;\n`;
        if (useValidation) {
            code += `using System.ComponentModel.DataAnnotations;\n`;
        }
        code += `\nnamespace ${namespace}\n{\n`;

        // Generate DTO
        code += `    public class ${entityName}Dto\n    {\n`;
        dtoFields.forEach(field => {
            if (useValidation) {
                code += `        [Required]\n`;
            }
            code += `        public ${field.type} ${field.name} { get; set; }\n`;
        });
        code += `    }\n\n`;

        // Generate Interface
        code += `    public interface I${entityName}Service\n    {\n`;
        code += `        Task<${entityName}Dto> ${httpMethod}${entityName}(${entityName}Dto dto);\n`;
        code += `    }\n\n`;

        // Generate Service
        code += `    public class ${entityName}Service : I${entityName}Service\n    {\n`;
        code += `        private readonly I${entityName}Repository _repository;\n`;
        
        // Add service dependencies
        if (dependencies.length > 0) {
            dependencies.forEach(dep => {
                code += `        private readonly ${dep.type} _${dep.name};\n`;
            });
        }
        code += '\n';
        
        // Constructor with dependencies
        if (dependencies.length > 0) {
            code += `        public ${entityName}Service(I${entityName}Repository repository, ${dependencies.map(d => `${d.type} ${d.name}`).join(', ')})\n        {\n`;
            code += `            _repository = repository;\n`;
            dependencies.forEach(dep => {
                code += `            _${dep.name} = ${dep.name};\n`;
            });
            code += `        }\n\n`;
        } else {
            code += `        public ${entityName}Service(I${entityName}Repository repository)\n        {\n`;
            code += `            _repository = repository;\n        }\n\n`;
        }

        code += `        public async Task<${entityName}Dto> ${httpMethod}${entityName}(${entityName}Dto dto)\n        {\n`;
        code += `            // TODO: Implement your business logic here\n`;
        code += `            throw new NotImplementedException();\n`;
        code += `        }\n    }\n\n`;

        // Generate Controller
        code += `    [ApiController]\n`;
        code += `    [Route("api/[controller]")]\n`;
        if (useAuthorization) {
            code += `    [Authorize]\n`;
        }
        code += `    public class ${entityName}Controller : ControllerBase\n    {\n`;
        code += `        private readonly I${entityName}Service _service;\n`;
        
        // Add controller dependencies
        if (dependencies.length > 0) {
            dependencies.forEach(dep => {
                code += `        private readonly ${dep.type} _${dep.name};\n`;
            });
        }
        code += '\n';
        
        // Constructor with dependencies
        if (dependencies.length > 0) {
            code += `        public ${entityName}Controller(I${entityName}Service service, ${dependencies.map(d => `${d.type} ${d.name}`).join(', ')})\n        {\n`;
            code += `            _service = service;\n`;
            dependencies.forEach(dep => {
                code += `            _${dep.name} = ${dep.name};\n`;
            });
            code += `        }\n\n`;
        } else {
            code += `        public ${entityName}Controller(I${entityName}Service service)\n        {\n`;
            code += `            _service = service;\n        }\n\n`;
        }

        code += `        [Http${httpMethod}]\n`;
        code += `        public async Task<ActionResult<${entityName}Dto>> ${httpMethod}${entityName}([FromBody] ${entityName}Dto dto)\n        {\n`;
        code += `            var result = await _service.${httpMethod}${entityName}(dto);\n`;
        code += `            return Ok(result);\n`;
        code += `        }\n    }\n`;
        
        code += `}\n`;
        
        return code;
    }

    generateSimpleCode(config) {
        const { entityName, httpMethod, dtoFields, namespace, useAuthorization, useValidation, dependencies } = config;
        
        let code = `using System;\nusing System.Threading.Tasks;\nusing Microsoft.AspNetCore.Mvc;\n`;
        if (useValidation) {
            code += `using System.ComponentModel.DataAnnotations;\n`;
        }
        code += `\nnamespace ${namespace}\n{\n`;

        // Generate DTO
        code += `    public class ${entityName}Dto\n    {\n`;
        dtoFields.forEach(field => {
            if (useValidation) {
                code += `        [Required]\n`;
            }
            code += `        public ${field.type} ${field.name} { get; set; }\n`;
        });
        code += `    }\n\n`;

        // Generate Controller
        code += `    [ApiController]\n`;
        code += `    [Route("api/[controller]")]\n`;
        if (useAuthorization) {
            code += `    [Authorize]\n`;
        }
        code += `    public class ${entityName}Controller : ControllerBase\n    {\n`;
        
        // Add controller dependencies
        if (dependencies.length > 0) {
            dependencies.forEach(dep => {
                code += `        private readonly ${dep.type} _${dep.name};\n`;
            });
            code += '\n';
            
            code += `        public ${entityName}Controller(${dependencies.map(d => `${d.type} ${d.name}`).join(', ')})\n        {\n`;
            dependencies.forEach(dep => {
                code += `            _${dep.name} = ${dep.name};\n`;
            });
            code += `        }\n\n`;
        }

        code += `        [Http${httpMethod}]\n`;
        code += `        public async Task<ActionResult<${entityName}Dto>> ${httpMethod}${entityName}([FromBody] ${entityName}Dto dto)\n        {\n`;
        code += `            // TODO: Implement your business logic here\n`;
        code += `            throw new NotImplementedException();\n`;
        code += `        }\n    }\n`;
        
        code += `}\n`;
        
        return code;
    }

    copyToClipboard() {
        const code = this.codePreview.textContent;
        if (code) {
            navigator.clipboard.writeText(code)
                .then(() => {
                    this.copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        this.copyButton.textContent = 'Copy Code';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        }
    }
}

// Initialize the code generator when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeGenerator();
});

// Initialize form
dtoFieldsContainer.appendChild(createFieldRow());
fieldCount++;

// Event Listeners
addFieldBtn.addEventListener('click', () => {
  dtoFieldsContainer.appendChild(createFieldRow());
  fieldCount++;
});

generateCodeBtn.addEventListener('click', () => {
  const config = getConfigFromForm();
  document.dispatchEvent(new CustomEvent('generateCode', { detail: config }));
});

saveConfigBtn.addEventListener('click', () => {
  const config = getConfigFromForm();
  localStorage.setItem('crudGeneratorConfig', JSON.stringify(config));
  alert('Configuration saved to Local Storage!');
});

loadConfigBtn.addEventListener('click', () => {
  const savedConfigStr = localStorage.getItem('crudGeneratorConfig');
  if (!savedConfigStr) {
    alert('No saved configuration found.');
    return;
  }
  const savedConfig = JSON.parse(savedConfigStr);

  // Apply config to form
  patternSelect.value = savedConfig.pattern || 'cqrs';
  httpMethodSelect.value = savedConfig.httpMethod || 'GET';
  entityNameInput.value = savedConfig.entityName || '';
  namespaceInput.value = savedConfig.namespace || '';
  useAuthorization.checked = !!savedConfig.authorization;
  useValidation.checked = !!savedConfig.validation;

  // Clear existing fields
  dtoFieldsContainer.innerHTML = '';
  if (savedConfig.dtoFields && savedConfig.dtoFields.length > 0) {
    savedConfig.dtoFields.forEach(field => {
      const row = createFieldRow();
      const inputs = row.querySelectorAll('input, select');
      inputs[0].value = field.name;
      inputs[1].value = field.type;
      dtoFieldsContainer.appendChild(row);
    });
  } else {
    dtoFieldsContainer.appendChild(createFieldRow());
  }

  alert('Configuration loaded from Local Storage!');
}); 