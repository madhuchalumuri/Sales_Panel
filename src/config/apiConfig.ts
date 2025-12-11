const { hostname, port } = window.location;

// Always use HTTPS
export const baseURL = `https://${hostname}${
  port ? `:${port}` : ""
}/License/api/v1/`;
// export const baseURL = "http://localhost:8081/License/api/v1/";
// export const baseURL = "http://192.168.86.132:8181/License/api/v1/";
