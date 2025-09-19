package com.medimitra.backend.repository;

import com.medimitra.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<User> userRowMapper = new RowMapper<User>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getString("id"));
            user.setEmail(rs.getString("email"));
            user.setPassword(rs.getString("password"));
            user.setName(rs.getString("name"));
            user.setImage(rs.getString("image"));
            user.setRole(rs.getString("role"));
            user.setPhoneNumber(rs.getString("phone_number"));
            
            // Handle date fields safely
            if (rs.getTimestamp("date_of_birth") != null) {
                user.setDateOfBirth(rs.getTimestamp("date_of_birth").toLocalDateTime());
            }
            
            user.setGender(rs.getString("gender"));
            user.setAddress(rs.getString("address"));
            user.setEmergencyContact(rs.getString("emergency_contact"));
            user.setBloodType(rs.getString("blood_type"));
            user.setAllergies(rs.getString("allergies"));
            user.setMedicalHistory(rs.getString("medical_history"));
            user.setEmailVerified(rs.getBoolean("email_verified"));
            
            if (rs.getTimestamp("created_at") != null) {
                user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            if (rs.getTimestamp("updated_at") != null) {
                user.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }
            
            return user;
        }
    };

    public User save(User user) {
        if (user.getId() == null) {
            // Create new user
            user.setId(UUID.randomUUID().toString());
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                INSERT INTO users (id, email, password, name, image, role, phone_number, 
                                 date_of_birth, gender, address, emergency_contact, blood_type, 
                                 allergies, medical_history, email_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            jdbcTemplate.update(sql,
                user.getId(), user.getEmail(), user.getPassword(), user.getName(),
                user.getImage(), user.getRole(), user.getPhoneNumber(),
                user.getDateOfBirth(), user.getGender(), user.getAddress(),
                user.getEmergencyContact(), user.getBloodType(), user.getAllergies(),
                user.getMedicalHistory(), user.isEmailVerified(), user.getCreatedAt(),
                user.getUpdatedAt()
            );
        } else {
            // Update existing user
            user.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                UPDATE users SET email = ?, password = ?, name = ?, image = ?, role = ?, 
                               phone_number = ?, date_of_birth = ?, gender = ?, address = ?, 
                               emergency_contact = ?, blood_type = ?, allergies = ?, 
                               medical_history = ?, email_verified = ?, updated_at = ?
                WHERE id = ?
                """;
            
            jdbcTemplate.update(sql,
                user.getEmail(), user.getPassword(), user.getName(), user.getImage(),
                user.getRole(), user.getPhoneNumber(), user.getDateOfBirth(),
                user.getGender(), user.getAddress(), user.getEmergencyContact(),
                user.getBloodType(), user.getAllergies(), user.getMedicalHistory(),
                user.isEmailVerified(), user.getUpdatedAt(), user.getId()
            );
        }
        return user;
    }

    public Optional<User> findById(String id) {
        try {
            String sql = "SELECT * FROM users WHERE id = ?";
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmail(String email) {
        try {
            String sql = "SELECT * FROM users WHERE email = ?";
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email);
            return Optional.of(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<User> findAll() {
        String sql = "SELECT * FROM users ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper);
    }

    public List<User> findByRole(String role) {
        String sql = "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper, role);
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public void deleteById(String id) {
        String sql = "DELETE FROM users WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public Optional<String> findUserIdByEmail(String email) {
        try {
            String sql = "SELECT id FROM users WHERE email = ?";
            String userId = jdbcTemplate.queryForObject(sql, String.class, email);
            return Optional.ofNullable(userId);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public long count() {
        String sql = "SELECT COUNT(*) FROM users";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public long countByRole(String role) {
        String sql = "SELECT COUNT(*) FROM users WHERE role = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, role);
        return count != null ? count : 0;
    }

    public List<User> findRecentUsers(int limit) {
        String sql = "SELECT * FROM users ORDER BY created_at DESC LIMIT ?";
        return jdbcTemplate.query(sql, userRowMapper, limit);
    }

    public void updateLastLogin(String userId) {
        String sql = "UPDATE users SET updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, LocalDateTime.now(), userId);
    }
}

