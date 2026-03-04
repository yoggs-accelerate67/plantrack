package com.plantrack.backend.service;    
    
import com.plantrack.backend.model.User;    

import java.util.List;    
     
public interface UserService {    
    
    public User createUser(User user);
    public List<User> getAllUsers();  
    public User getUserById(Long id);
    public User updateUser(Long id, User userDetails);
    public void deleteUser(Long id);

}