package pccit.finalproject.javaclient.pojos;

public class LoginRes {
    private String message;
    private User user;

    public void setMessage(String msg){
        message=msg;
    }

    public String getMessage() {
        return message;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }
}
