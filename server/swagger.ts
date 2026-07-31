export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Grievance & Redressal Management Portal - User Module API",
    version: "1.0.0",
    description: "RESTful API documentation for the User Module of Campus Voice Grievance Portal."
  },
  servers: [
    {
      url: "/api",
      description: "Local Express Server"
    }
  ],
  paths: {
    "/complaints": {
      get: {
        summary: "Get list of user complaints",
        parameters: [
          { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status" },
          { name: "department", in: "query", schema: { type: "string" }, description: "Filter by department" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search query" }
        ],
        responses: {
          "200": { description: "Successful response" }
        }
      },
      post: {
        summary: "Raise a new complaint (with optional supporting file attachments)",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  department: { type: "string" },
                  category: { type: "string" },
                  subject: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["Low", "Medium", "High"] },
                  location: { type: "string" },
                  supportingFiles: { type: "array", items: { type: "string", format: "binary" } }
                },
                required: ["department", "category", "subject", "description"]
              }
            }
          }
        },
        responses: {
          "201": { description: "Complaint created successfully" }
        }
      }
    },
    "/complaints/stats": {
      get: {
        summary: "Get complaint statistics counters",
        responses: {
          "200": { description: "Total, In Progress, Resolved, Rejected metrics" }
        }
      }
    },
    "/complaints/{id}": {
      get: {
        summary: "Get complaint details by ID or Complaint Number",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Complaint details and timeline" },
          "404": { description: "Complaint not found" }
        }
      }
    },
    "/complaints/{id}/remarks": {
      post: {
        summary: "Add a comment/remark to a complaint",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  text: { type: "string" }
                },
                required: ["text"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Remark added successfully" }
        }
      }
    },
    "/notifications": {
      get: {
        summary: "Get list of notifications",
        parameters: [
          { name: "filter", in: "query", schema: { type: "string", enum: ["all", "unread", "read", "important"] } }
        ],
        responses: {
          "200": { description: "Notification items list" }
        }
      }
    },
    "/notifications/{id}/read": {
      patch: {
        summary: "Mark notification as read",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Marked as read" }
        }
      }
    },
    "/notifications/read-all": {
      patch: {
        summary: "Mark all notifications as read",
        responses: {
          "200": { description: "All marked as read" }
        }
      }
    },
    "/profile": {
      get: {
        summary: "Get authenticated user profile details",
        responses: {
          "200": { description: "User profile JSON" }
        }
      },
      put: {
        summary: "Update user profile info",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  phone: { type: "string" },
                  email: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Updated profile details" }
        }
      }
    }
  }
};

export function generatePostmanCollection() {
  return {
    info: {
      name: "Campus Voice - User Module API",
      description: "Postman collection for testing Grievance Portal User Module endpoints.",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      {
        name: "Complaints",
        item: [
          {
            name: "Get Complaints List",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/complaints?status=All",
                host: ["{{baseUrl}}"],
                path: ["api", "complaints"]
              }
            }
          },
          {
            name: "Get Complaint Stats",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/complaints/stats",
                host: ["{{baseUrl}}"],
                path: ["api", "complaints", "stats"]
              }
            }
          },
          {
            name: "Get Complaint Details",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/complaints/CMP-2026-0123",
                host: ["{{baseUrl}}"],
                path: ["api", "complaints", "CMP-2026-0123"]
              }
            }
          },
          {
            name: "Raise New Complaint",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  department: "Network / Wi-Fi",
                  category: "Internet Connectivity",
                  subject: "Wi-Fi disconnections in Library",
                  description: "Frequent disconnection issues on 2nd floor study tables.",
                  priority: "High",
                  location: "Central Library"
                }, null, 2)
              },
              url: {
                raw: "{{baseUrl}}/api/complaints",
                host: ["{{baseUrl}}"],
                path: ["api", "complaints"]
              }
            }
          }
        ]
      },
      {
        name: "Notifications",
        item: [
          {
            name: "Get Notifications",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/notifications?filter=all",
                host: ["{{baseUrl}}"],
                path: ["api", "notifications"]
              }
            }
          },
          {
            name: "Mark All Read",
            request: {
              method: "PATCH",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/notifications/read-all",
                host: ["{{baseUrl}}"],
                path: ["api", "notifications", "read-all"]
              }
            }
          }
        ]
      },
      {
        name: "Profile",
        item: [
          {
            name: "Get User Profile",
            request: {
              method: "GET",
              header: [],
              url: {
                raw: "{{baseUrl}}/api/profile",
                host: ["{{baseUrl}}"],
                path: ["api", "profile"]
              }
            }
          }
        ]
      }
    ]
  };
}
