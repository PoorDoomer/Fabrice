/**
 * Generate code for Service/Repository Pattern
 */
function generateServiceCode(config) {
  const {
    entityName,
    httpMethod,
    dtoFields,
    namespace,
    authorization,
    validation
  } = config;

  const dtoName = `${entityName}Dto`;

  let dtoProps = dtoFields.map(f => `        public ${f.type} ${f.name} { get; set; }`).join('\n');
  if (validation) {
    dtoProps = dtoFields.map(f =>
      `        [Required]\n        public ${f.type} ${f.name} { get; set; }`
    ).join('\n');
  }

  // For simplicity, we generate only one method signature for each HTTP method
  const serviceMethodName = `Handle${httpMethod}`;
  const repositoryMethodName = `Perform${httpMethod}`;

  return `using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
${(authorization) ? "using Microsoft.AspNetCore.Authorization;" : ""}

namespace ${namespace}.ServiceRepository
{
    /// <summary>
    /// DTO for ${entityName}
    /// </summary>
    public class ${dtoName}
    {
${dtoProps}
    }

    /// <summary>
    /// Service interface for ${entityName}
    /// </summary>
    public interface I${entityName}Service
    {
        bool ${serviceMethodName}(${dtoName} dto);
    }

    /// <summary>
    /// Service implementation for ${entityName}
    /// </summary>
    public class ${entityName}Service : I${entityName}Service
    {
        private readonly I${entityName}Repository _repository;

        public ${entityName}Service(I${entityName}Repository repository)
        {
            _repository = repository;
        }

        public bool ${serviceMethodName}(${dtoName} dto)
        {
            // Add your business logic here
            return _repository.${repositoryMethodName}(dto);
        }
    }

    /// <summary>
    /// Repository interface for ${entityName}
    /// </summary>
    public interface I${entityName}Repository
    {
        bool ${repositoryMethodName}(${dtoName} dto);
    }

    /// <summary>
    /// Controller for ${entityName}
    /// </summary>
    ${(authorization) ? "[Authorize]" : ""}
    [ApiController]
    [Route("api/[controller]")]
    public class ${entityName}Controller : ControllerBase
    {
        private readonly I${entityName}Service _service;

        public ${entityName}Controller(I${entityName}Service service)
        {
            _service = service;
        }

        [Http${httpMethod}("${entityName}")]
        public IActionResult ${httpMethod}${entityName}([FromBody] ${dtoName} dto)
        {
            var result = _service.${serviceMethodName}(dto);
            if (result)
                return Ok("${httpMethod} operation succeeded");
            else
                return BadRequest("${httpMethod} operation failed");
        }
    }
}`;
} 