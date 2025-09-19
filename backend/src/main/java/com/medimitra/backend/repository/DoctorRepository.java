package com.medimitra.backend.repository;

import com.medimitra.backend.model.Doctor;
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
public class DoctorRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RowMapper<Doctor> doctorRowMapper = new RowMapper<Doctor>() {
        @Override
        public Doctor mapRow(ResultSet rs, int rowNum) throws SQLException {
            Doctor doctor = new Doctor();
            doctor.setId(rs.getString("id"));
            doctor.setUserId(rs.getString("user_id"));
            doctor.setLicenseNumber(rs.getString("license_number"));
            doctor.setSpecialization(rs.getString("specialization"));
            doctor.setExperience(rs.getInt("experience"));
            doctor.setHospital(rs.getString("hospital"));
            doctor.setConsultationFee(rs.getBigDecimal("consultation_fee"));
            doctor.setAvailability(rs.getString("availability"));
            doctor.setRating(rs.getBigDecimal("rating"));
            doctor.setTotalRatings(rs.getInt("total_ratings"));
            
            // Enhanced credentials
            doctor.setMedicalDegree(rs.getString("medical_degree"));
            doctor.setUniversity(rs.getString("university"));
            if (rs.getObject("graduation_year") != null) {
                doctor.setGraduationYear(rs.getInt("graduation_year"));
            }
            doctor.setBoardCertification(rs.getString("board_certification"));
            doctor.setAdditionalQualifications(rs.getString("additional_qualifications"));
            doctor.setLanguages(rs.getString("languages"));
            doctor.setBio(rs.getString("bio"));
            doctor.setProfilePictureUrl(rs.getString("profile_picture_url"));
            
            // Verification status
            doctor.setIsVerified(rs.getBoolean("is_verified"));
            doctor.setVerificationDocuments(rs.getString("verification_documents"));
            doctor.setVerificationStatus(rs.getString("verification_status"));
            doctor.setRejectionReason(rs.getString("rejection_reason"));
            if (rs.getTimestamp("verified_at") != null) {
                doctor.setVerifiedAt(rs.getTimestamp("verified_at").toLocalDateTime());
            }
            doctor.setVerifiedBy(rs.getString("verified_by"));
            
            if (rs.getTimestamp("created_at") != null) {
                doctor.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            }
            if (rs.getTimestamp("updated_at") != null) {
                doctor.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
            }
            
            return doctor;
        }
    };

    public Doctor save(Doctor doctor) {
        if (doctor.getId() == null) {
            // Create new doctor
            doctor.setId(UUID.randomUUID().toString());
            doctor.setCreatedAt(LocalDateTime.now());
            doctor.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                INSERT INTO doctors (id, user_id, license_number, specialization, experience, 
                                   hospital, consultation_fee, availability, rating, total_ratings, 
                                   created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            jdbcTemplate.update(sql,
                doctor.getId(), doctor.getUserId(), doctor.getLicenseNumber(),
                doctor.getSpecialization(), doctor.getExperience(), doctor.getHospital(),
                doctor.getConsultationFee(), doctor.getAvailability(), doctor.getRating(),
                doctor.getTotalRatings(), doctor.getCreatedAt(), doctor.getUpdatedAt()
            );
        } else {
            // Update existing doctor
            doctor.setUpdatedAt(LocalDateTime.now());
            
            String sql = """
                UPDATE doctors SET user_id = ?, license_number = ?, specialization = ?, 
                                 experience = ?, hospital = ?, consultation_fee = ?, 
                                 availability = ?, rating = ?, total_ratings = ?, updated_at = ?
                WHERE id = ?
                """;
            
            jdbcTemplate.update(sql,
                doctor.getUserId(), doctor.getLicenseNumber(), doctor.getSpecialization(),
                doctor.getExperience(), doctor.getHospital(), doctor.getConsultationFee(),
                doctor.getAvailability(), doctor.getRating(), doctor.getTotalRatings(),
                doctor.getUpdatedAt(), doctor.getId()
            );
        }
        return doctor;
    }

    public Optional<Doctor> findById(String id) {
        try {
            String sql = "SELECT * FROM doctors WHERE id = ?";
            Doctor doctor = jdbcTemplate.queryForObject(sql, doctorRowMapper, id);
            return Optional.of(doctor);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Doctor> findByUserId(String userId) {
        try {
            String sql = "SELECT * FROM doctors WHERE user_id = ?";
            Doctor doctor = jdbcTemplate.queryForObject(sql, doctorRowMapper, userId);
            return Optional.of(doctor);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Doctor> findByLicenseNumber(String licenseNumber) {
        try {
            String sql = "SELECT * FROM doctors WHERE license_number = ?";
            Doctor doctor = jdbcTemplate.queryForObject(sql, doctorRowMapper, licenseNumber);
            return Optional.of(doctor);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Doctor> findAll() {
        String sql = "SELECT * FROM doctors ORDER BY rating DESC, total_ratings DESC";
        return jdbcTemplate.query(sql, doctorRowMapper);
    }

    public List<Doctor> findBySpecialization(String specialization) {
        String sql = "SELECT * FROM doctors WHERE specialization = ? ORDER BY rating DESC, total_ratings DESC";
        return jdbcTemplate.query(sql, doctorRowMapper, specialization);
    }

    public List<Doctor> findByHospital(String hospital) {
        String sql = "SELECT * FROM doctors WHERE hospital = ? ORDER BY rating DESC, total_ratings DESC";
        return jdbcTemplate.query(sql, doctorRowMapper, hospital);
    }

    public List<Doctor> findTopRatedDoctors(int limit) {
        String sql = """
            SELECT * FROM doctors 
            WHERE total_ratings > 0 
            ORDER BY rating DESC, total_ratings DESC 
            LIMIT ?
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, limit);
    }

    public List<Doctor> findByExperienceRange(int minExperience, int maxExperience) {
        String sql = """
            SELECT * FROM doctors 
            WHERE experience BETWEEN ? AND ? 
            ORDER BY experience DESC, rating DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, minExperience, maxExperience);
    }

    public List<String> findDistinctSpecializations() {
        String sql = "SELECT DISTINCT specialization FROM doctors ORDER BY specialization";
        return jdbcTemplate.queryForList(sql, String.class);
    }

    public List<String> findDistinctHospitals() {
        String sql = "SELECT DISTINCT hospital FROM doctors WHERE hospital IS NOT NULL ORDER BY hospital";
        return jdbcTemplate.queryForList(sql, String.class);
    }

    public boolean existsByLicenseNumber(String licenseNumber) {
        String sql = "SELECT COUNT(*) FROM doctors WHERE license_number = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, licenseNumber);
        return count != null && count > 0;
    }

    public boolean existsByUserId(String userId) {
        String sql = "SELECT COUNT(*) FROM doctors WHERE user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null && count > 0;
    }

    public void deleteById(String id) {
        String sql = "DELETE FROM doctors WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void deleteByUserId(String userId) {
        String sql = "DELETE FROM doctors WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }

    public long count() {
        String sql = "SELECT COUNT(*) FROM doctors";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public long countBySpecialization(String specialization) {
        String sql = "SELECT COUNT(*) FROM doctors WHERE specialization = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, specialization);
        return count != null ? count : 0;
    }

    public List<Doctor> findByNameContaining(String name) {
        String sql = """
            SELECT d.* FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE LOWER(u.name) LIKE LOWER(?) 
            ORDER BY d.rating DESC, d.total_ratings DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, "%" + name + "%");
    }

    // Methods for verified doctors
    public List<Doctor> findVerifiedDoctors() {
        String sql = """
            SELECT * FROM doctors 
            WHERE is_verified = true AND verification_status = 'approved'
            ORDER BY rating DESC, total_ratings DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper);
    }

    public List<Doctor> findVerifiedDoctorsBySpecialization(String specialization) {
        String sql = """
            SELECT * FROM doctors 
            WHERE specialization = ? AND is_verified = true AND verification_status = 'approved'
            ORDER BY rating DESC, total_ratings DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, specialization);
    }

    public List<Doctor> findVerifiedDoctorsByHospital(String hospital) {
        String sql = """
            SELECT * FROM doctors 
            WHERE hospital = ? AND is_verified = true AND verification_status = 'approved'
            ORDER BY rating DESC, total_ratings DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, hospital);
    }

    public List<Doctor> findVerifiedDoctorsByName(String name) {
        String sql = """
            SELECT d.* FROM doctors d 
            JOIN users u ON d.user_id = u.id 
            WHERE LOWER(u.name) LIKE LOWER(?) 
            AND d.is_verified = true AND d.verification_status = 'approved'
            ORDER BY d.rating DESC, d.total_ratings DESC
            """;
        return jdbcTemplate.query(sql, doctorRowMapper, "%" + name + "%");
    }

    public long countVerifiedDoctors() {
        String sql = "SELECT COUNT(*) FROM doctors WHERE is_verified = true AND verification_status = 'approved'";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    public Optional<String> findDoctorIdByUserId(String userId) {
        try {
            String sql = "SELECT id FROM doctors WHERE user_id = ?";
            String doctorId = jdbcTemplate.queryForObject(sql, String.class, userId);
            return Optional.ofNullable(doctorId);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}

