import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // we are on the server
    return axios.create({
      // baseURL: "http://ingress-nginx.ingress-nginx.svc.cluster.local",
      baseURL: "http://www.my-fake-ticketing-app.xyz",
      headers: req.headers,
    });
  } else {
    // we are on the browser
    return axios.create();
  }
};
