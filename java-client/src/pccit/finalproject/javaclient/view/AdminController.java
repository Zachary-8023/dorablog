package pccit.finalproject.javaclient.view;

import pccit.finalproject.javaclient.pojos.LoginRes;
import pccit.finalproject.javaclient.pojos.User;
import pccit.finalproject.javaclient.web.API;

import javax.swing.*;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
import java.util.List;

/**
 * Controller for admin UI (MVC pattern)
 * Handles user interactions and coordinates between view and model
 */
public class AdminController implements ActionListener, ListSelectionListener, UserModelObserver {
    private AdminFrame view;
    private UserModel model;
    private User currentUser;

    public AdminController(AdminFrame view) {
        this.view = view;
        this.model = view.getUserModel();
        
        setupEventListeners();
        model.addObserver(this);
    }

    private void setupEventListeners() {
        view.getLoginButton().addActionListener(this);
        view.getLogoutButton().addActionListener(this);
        view.getDeleteButton().addActionListener(this);
        
        view.getUserTable().getSelectionModel().addListSelectionListener(this);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        Object source = e.getSource();
        
        if (source == view.getLoginButton()) {
            handleLogin();
        } else if (source == view.getLogoutButton()) {
            handleLogout();
        } else if (source == view.getDeleteButton()) {
            handleDeleteUser();
        }
    }

    private void handleLogin() {
        String username = view.getUsername();
        String password = view.getPassword();
        
        if (username.isEmpty() || password.isEmpty()) {
            view.showError("Please enter both username and password");
            return;
        }

        // Perform login in background thread to avoid freezing UI
        SwingUtilities.invokeLater(() -> {
            try {
                LoginRes res = API.getInstance().login(username, password);
                
                if (res.getUser().isAdmin()) {
                    // Load users list
                    loadUsers();
                    currentUser = res.getUser();
                    view.updateUIState(true, false);
                } else {
                    view.showError("Access denied. Admin privileges required.");
                    API.getInstance().logout();
                    view.updateUIState(false, false);
                }
            } catch (Exception ex) {
                view.showError("Login failed: " + ex.getMessage());
                view.updateUIState(false, false);
            }
        });
    }

    private void handleLogout() {
        try {
            API.getInstance().logout();
            model.setUsers(java.util.Collections.emptyList());
            model.setSelectedUser(null);
            currentUser = null;
            view.getProfilePanel().displayUser(null);
            view.updateUIState(false, false);
            view.getUsernameField().setText("");
            view.getPasswordField().setText("");
        } catch (Exception ex) {
            view.showError("Logout failed: " + ex.getMessage());
        }
    }

    private void handleDeleteUser() {
        User selectedUser = model.getSelectedUser();
        if (selectedUser == null) {
            return;
        }

        int confirm = JOptionPane.showConfirmDialog(
            view,
            "Are you sure you want to delete user: " + selectedUser.getUsername() + "?",
            "Confirm Delete",
            JOptionPane.YES_NO_OPTION
        );

        if (confirm == JOptionPane.YES_OPTION) {
            SwingUtilities.invokeLater(() -> {
                try {
                    API.getInstance().deleteUser(selectedUser.getId());
                    model.removeUser(selectedUser);
                    view.getProfilePanel().displayUser(null);
                } catch (IOException ex) {
                    view.showError("Failed to delete user: " + ex.getMessage());
                }
            });
        }
    }

    private void loadUsers() {
        SwingUtilities.invokeLater(() -> {
            try {
                List<User> users = API.getInstance().getUsers();
                model.setUsers(users);
            } catch (IOException ex) {
                view.showError("Failed to load users: " + ex.getMessage());
            }
        });
    }

    @Override
    public void valueChanged(ListSelectionEvent e) {
        if (!e.getValueIsAdjusting()) {
            int selectedRow = view.getUserTable().getSelectedRow();
            if (selectedRow >= 0) {
                User selectedUser = model.getUserAt(selectedRow);
                model.setSelectedUser(selectedUser);
                view.getProfilePanel().displayUser(selectedUser);
                
                // Load avatar asynchronously
                loadUserAvatar(selectedUser);
            } else {
                model.setSelectedUser(null);
                view.getProfilePanel().displayUser(null);
            }
        }
    }

    private void loadUserAvatar(User user) {
        if (user == null || user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            view.getProfilePanel().displayAvatar(null);
            return;
        }

        URL url;
        String avatarUrl = user.getAvatarUrl();
        try {
            if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
                url = URI.create(avatarUrl).toURL();
            } else {
                url = AdminController.class.getResource("/pccit/finalproject/javaclient/" 
                + avatarUrl);
            }
            view.getProfilePanel().displayAvatar(url);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }

    }

    // UserModelObserver methods
    @Override
    public void userModelChanged(UserModel model) {
        // Update UI state based on model
        boolean hasSelection = model.hasSelection();
        view.updateUIState(currentUser != null, hasSelection);
    }

    @Override
    public void userSelectionChanged(User selectedUser) {
        // Update delete button state
        view.updateUIState(currentUser != null, selectedUser != null);
    }
}

