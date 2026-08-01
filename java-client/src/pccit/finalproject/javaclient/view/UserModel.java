package pccit.finalproject.javaclient.view;

import pccit.finalproject.javaclient.pojos.User;

import javax.swing.table.AbstractTableModel;
import java.util.ArrayList;
import java.util.List;

/**
 * Model for managing user data using Observer pattern
 * Extends AbstractTableModel to serve as adapter for JTable
 */
public class UserModel extends AbstractTableModel {
    private List<User> users;
    private List<UserModelObserver> observers;
    private User selectedUser;

    public UserModel() {
        users = new ArrayList<>();
        observers = new ArrayList<>();
    }

    /**
     * Observer pattern: add observer
     */
    public void addObserver(UserModelObserver observer) {
        if (!observers.contains(observer)) {
            observers.add(observer);
        }
    }

    /**
     * Observer pattern: remove observer
     */
    public void removeObserver(UserModelObserver observer) {
        observers.remove(observer);
    }

    /**
     * Observer pattern: notify all observers
     */
    private void notifyObservers() {
        for (UserModelObserver observer : observers) {
            observer.userModelChanged(this);
        }
    }

    /**
     * Observer pattern: notify selection observers
     */
    private void notifySelectionObservers() {
        for (UserModelObserver observer : observers) {
            observer.userSelectionChanged(selectedUser);
        }
    }

    public void setUsers(List<User> users) {
        this.users = users;
        this.selectedUser = null;
        fireTableDataChanged();
        notifyObservers();
    }

    public void removeUser(User user) {
        if (users.remove(user)) {
            if (selectedUser == user) {
                selectedUser = null;
                notifySelectionObservers();
            }
            fireTableDataChanged();
            notifyObservers();
        }
    }

    public void setSelectedUser(User user) {
        this.selectedUser = user;
        notifySelectionObservers();
    }

    public User getSelectedUser() {
        return selectedUser;
    }

    public User getUserAt(int index) {
        if (index >= 0 && index < users.size()) {
            return users.get(index);
        }
        return null;
    }

    public boolean hasUsers() {
        return !users.isEmpty();
    }

    public boolean hasSelection() {
        return selectedUser != null;
    }

    // TableModel methods (Adapter pattern)
    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return 4; // ID, Username, Realname, Admin
    }

    @Override
    public String getColumnName(int column) {
        switch (column) {
            case 0: return "ID";
            case 1: return "Username";
            case 2: return "Real Name";
            case 3: return "Admin";
            default: return "";
        }
    }

    @Override
    public Object getValueAt(int row, int column) {
        User user = users.get(row);
        switch (column) {
            case 0: return user.getId();
            case 1: return user.getUsername();
            case 2: return user.getRealname();
            case 3: return user.isAdmin() ? "Yes" : "No";
            default: return null;
        }
    }

    @Override
    public Class<?> getColumnClass(int column) {
        switch (column) {
            case 0: return Integer.class;
            case 3: return String.class;
            default: return String.class;
        }
    }
}

/**
 * Observer interface for UserModel changes
 */
interface UserModelObserver {
    void userModelChanged(UserModel model);
    void userSelectionChanged(User selectedUser);
}

