/**
 * Generate code for Simple Controller Pattern
 */
function generateSimpleControllerCode(config) {
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

  return `using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
${(authorization) ? "using Microsoft.AspNetCore.Authorization;" : ""}

namespace ${namespace}.Simple
{
    /// <summary>
    /// DTO for ${entityName}
    /// </summary>
    public class ${dtoName}
    {
${dtoProps}
    }

    /// <summary>
    /// A simple controller for ${entityName}
    /// </summary>
    ${(authorization) ? "[Authorize]" : ""}
    [ApiController]
    [Route("api/[controller]")]
    public class ${entityName}Controller : ControllerBase
    {
        [Http${httpMethod}("${entityName}")]
        public IActionResult ${httpMethod}${entityName}([FromBody] ${dtoName} dto)
        {
            // Simple direct logic here
            return Ok("Success");
        }
    }
}`;
} 