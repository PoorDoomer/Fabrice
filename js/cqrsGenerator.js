/**
 * Generate code for CQRS Pattern
 */
function generateCQRSCode(config) {
  const {
    entityName,
    httpMethod,
    dtoFields,
    namespace,
    authorization,
    validation
  } = config;

  const opName = httpMethod.charAt(0) + httpMethod.slice(1).toLowerCase();
  const commandName = `${entityName}${opName}Command`;
  const handlerName = `${entityName}${opName}Handler`;
  const dtoName = `${entityName}${opName}Dto`;

  let dtoProps = dtoFields.map(f => `    public ${f.type} ${f.name} { get; set; }`).join('\n');
  if (validation) {
    dtoProps = dtoFields.map(f => 
      `    [Required]\n    public ${f.type} ${f.name} { get; set; }`
    ).join('\n');
  }

  return `using System;
using System.ComponentModel.DataAnnotations;
using MediatR;
using Microsoft.AspNetCore.Mvc;
${(authorization) ? "using Microsoft.AspNetCore.Authorization;" : ""}

namespace ${namespace}.CQRS
{
    /// <summary>
    /// DTO for ${entityName} ${opName} operation
    /// </summary>
    public class ${dtoName}
    {
${dtoProps}
    }

    /// <summary>
    /// Command for ${entityName} ${opName}
    /// </summary>
    public class ${commandName} : IRequest<bool>
    {
${dtoProps}
    }

    /// <summary>
    /// Handler for ${commandName}
    /// </summary>
    public class ${handlerName} : IRequestHandler<${commandName}, bool>
    {
        public ${handlerName}()
        {
            // TODO: inject dependencies
        }

        public async Task<bool> Handle(${commandName} request, CancellationToken cancellationToken)
        {
            // TODO: implement command logic
            return true;
        }
    }

    /// <summary>
    /// Controller for ${entityName}
    /// </summary>
    ${(authorization) ? "[Authorize]" : ""}
    [ApiController]
    [Route("api/[controller]")]
    public class ${entityName}Controller : ControllerBase
    {
        private readonly IMediator _mediator;

        public ${entityName}Controller(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Http${opName}("${entityName}")]
        public async Task<IActionResult> ${opName}${entityName}([FromBody] ${dtoName} dto)
        {
            var command = new ${commandName}
            {
${dtoFields.map(f => `                ${f.name} = dto.${f.name},`).join('\n')}
            };

            var result = await _mediator.Send(command);
            if (result)
                return Ok("Operation succeeded");
            else
                return BadRequest("Operation failed");
        }
    }
}
`;
} 