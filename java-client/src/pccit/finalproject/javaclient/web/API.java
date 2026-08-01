package pccit.finalproject.javaclient.web;

import pccit.finalproject.javaclient.pojos.LoginRes;
import pccit.finalproject.javaclient.pojos.User;
import pccit.finalproject.javaclient.util.JSONUtils;

import java.io.IOException;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class API {
    private static API instance;

    private static final String BASE_URL = "http://localhost:3000/api";

    public static API getInstance() {
        if (instance == null) {
            instance = new API();
        }
        return instance;
    }

    private final CookieManager cookieManager;
    private final HttpClient client;

    private API() {
        this.cookieManager = new CookieManager();

        this.client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(10))
                .cookieHandler(this.cookieManager)
                .build();
    }

    public LoginRes login(String username, String password) throws IOException, InterruptedException {
        Map<String, String> requstMap = new HashMap<>();
        requstMap.put("username", username);
        requstMap.put("password", password);

        String json = JSONUtils.toJSON(requstMap);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/auth/login"))
                .setHeader("Content-Type", "application/json")
                .setHeader("Accept", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(json));
        HttpRequest request = builder.build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String responseJson = response.body();
        LoginRes res = JSONUtils.toObject(responseJson, LoginRes.class);
        if (response.statusCode() == 200) {
            return res;
        }else {
            throw new IOException("Login error: " + res.getMessage());
        }
    }

    public void logout() throws InterruptedException, IOException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/auth/logout"))
                .setHeader("credentials", "include")
                .method("POST", HttpRequest.BodyPublishers.noBody());
        HttpRequest request = builder.build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    public void deleteUser(int userId) throws IOException {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/users/" + userId))
                    .setHeader("credentials", "include")
                    .method("DELETE", HttpRequest.BodyPublishers.noBody());
            HttpRequest request = builder.build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int responseCode = response.statusCode();
            if (responseCode != 204) {
                throw new IOException("Failed to delete user: " + responseCode);
            }
        } catch (Exception e) {
            throw new IOException("Delete user error: " + e.getMessage());
        }
    }

    public List<User> getUsers() throws IOException {
        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + "/users"))
                    .setHeader("credentials", "include")
                    .method("GET", HttpRequest.BodyPublishers.noBody());
            HttpRequest request = builder.build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            int responseCode = response.statusCode();
            if (responseCode == 200) {
                String responseJson = response.body();
                // Parse array of users
                return JSONUtils.toList(responseJson, User.class);
            } else {
                throw new IOException("Failed to get users: " + responseCode);
            }
        } catch (Exception e) {
            throw new IOException("Get users error: " + e.getMessage());
        }
    }
}
