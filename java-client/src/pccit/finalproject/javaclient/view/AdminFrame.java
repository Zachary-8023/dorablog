package pccit.finalproject.javaclient.view;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import java.awt.*;

/**
 * Main admin window view
 * Implements MVC view layer
 */
public class AdminFrame extends JFrame {
    // Login panel components
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton logoutButton;
    
    // User table
    private JTable userTable;
    private UserModel userModel;
    
    // Delete button
    private JButton deleteButton;
    
    // Profile panel
    private UserProfilePanel profilePanel;

    public AdminFrame() {
        initializeComponents();
        layoutComponents();
        setTitle("Admin User Management");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(800, 600);
        setLocationRelativeTo(null);
    }

    private void initializeComponents() {
        usernameField = new JTextField(15);
        passwordField = new JPasswordField(15);
        loginButton = new JButton("Login");
        logoutButton = new JButton("Logout");
        
        userModel = new UserModel();
        userTable = new JTable(userModel);
        userTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        
        deleteButton = new JButton("Delete User");
        
        profilePanel = new UserProfilePanel();
        
        // Set initial states
        updateUIState(false, false);
    }

    private void layoutComponents() {
        setLayout(new BorderLayout(10, 10));
        
        // Top: Login panel
        JPanel loginPanel = createLoginPanel();
        add(loginPanel, BorderLayout.NORTH);
        
        // Center: User table
        JScrollPane scrollPane = new JScrollPane(userTable);
        scrollPane.setBorder(new TitledBorder("Users"));
        add(scrollPane, BorderLayout.CENTER);
        
        // Right: Profile and delete
        JPanel rightPanel = new JPanel(new BorderLayout(5, 5));
        rightPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        JPanel profileContainer = new JPanel(new BorderLayout());
        profileContainer.setBorder(new TitledBorder("Selected User Profile"));
        profileContainer.add(profilePanel, BorderLayout.CENTER);
        
        JPanel deletePanel = new JPanel();
        deletePanel.add(deleteButton);
        
        rightPanel.add(profileContainer, BorderLayout.CENTER);
        rightPanel.add(deletePanel, BorderLayout.SOUTH);
        
        add(rightPanel, BorderLayout.EAST);
    }

    //TODO: invest BorderLayout, GridBagLayout, BoxLayout, GroupLayout
    private JPanel createLoginPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.anchor = GridBagConstraints.WEST;
        
        // Labels
        gbc.gridx = 0; gbc.gridy = 0;
        panel.add(new JLabel("Username:"), gbc);
        gbc.gridx = 0; gbc.gridy = 1;
        panel.add(new JLabel("Password:"), gbc);
        
        // Fields
        gbc.gridx = 1; gbc.gridy = 0;
        gbc.gridwidth = 2;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        panel.add(usernameField, gbc);
        
        gbc.gridx = 1; gbc.gridy = 1;
        panel.add(passwordField, gbc);
        
        // Buttons
        gbc.gridx = 0; gbc.gridy = 2;
        gbc.gridwidth = 1;
        gbc.fill = GridBagConstraints.NONE;
        panel.add(loginButton, gbc);
        
        gbc.gridx = 1; gbc.gridy = 2;
        panel.add(logoutButton, gbc);
        
        return panel;
    }

    // Getters for controller to access
    public String getUsername() {
        return usernameField.getText();
    }

    public String getPassword() {
        return new String(passwordField.getPassword());
    }

    public UserModel getUserModel() {
        return userModel;
    }

    public JTable getUserTable() {
        return userTable;
    }

    public JButton getLoginButton() {
        return loginButton;
    }

    public JButton getLogoutButton() {
        return logoutButton;
    }

    public JButton getDeleteButton() {
        return deleteButton;
    }

    public UserProfilePanel getProfilePanel() {
        return profilePanel;
    }

    public JTextField getUsernameField() {
        return usernameField;
    }

    public JPasswordField getPasswordField() {
        return passwordField;
    }

    // Update UI state based on authentication and selection status
    public void updateUIState(boolean authenticated, boolean selectionExists) {
        loginButton.setEnabled(!authenticated);
        logoutButton.setEnabled(authenticated);
        usernameField.setEnabled(!authenticated);
        passwordField.setEnabled(!authenticated);
        deleteButton.setEnabled(authenticated && selectionExists);
    }

    // Show error dialog
    public void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Error", JOptionPane.ERROR_MESSAGE);
    }

    // Show info dialog
    public void showInfo(String message) {
        JOptionPane.showMessageDialog(this, message, "Information", JOptionPane.INFORMATION_MESSAGE);
    }
}

