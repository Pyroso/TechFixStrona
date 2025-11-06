/**
 * @typedef {Object} ErrorReport
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} location
 * @property {number} latitude
 * @property {number} longitude
 * @property {"Low" | "Medium" | "High" | "Critical"} priority
 * @property {"New" | "In Progress" | "Resolved"} status
 * @property {string} [assignedTechnician]
 * @property {string} timestamp
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} CreateReportInput
 * @property {string} title
 * @property {string} description
 * @property {string} location
 * @property {number} latitude
 * @property {number} longitude
 * @property {"Low" | "Medium" | "High" | "Critical"} priority
 */

/**
 * @typedef {Object} UpdateReportInput
 * @property {"New" | "In Progress" | "Resolved"} [status]
 * @property {string} [assignedTechnician]
 */

/**
 * @typedef {"technician" | "worker"} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {UserRole} role
 */

export {}
