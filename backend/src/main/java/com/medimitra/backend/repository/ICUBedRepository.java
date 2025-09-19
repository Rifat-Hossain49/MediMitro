package com.medimitra.backend.repository;

import com.medimitra.backend.model.ICUBed;
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
public class ICUBedRepository {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  private final RowMapper<ICUBed> icuBedRowMapper = new RowMapper<ICUBed>() {
    @Override
    public ICUBed mapRow(ResultSet rs, int rowNum) throws SQLException {
      ICUBed bed = new ICUBed();
      bed.setId(rs.getString("id"));
      bed.setBedNumber(rs.getString("bed_number"));
      bed.setHospital(rs.getString("hospital"));
      bed.setHospitalAddress(rs.getString("hospital_address"));
      bed.setIcuType(rs.getString("icu_type"));
      bed.setStatus(rs.getString("status"));
      bed.setDailyRate(rs.getBigDecimal("daily_rate"));
      bed.setEquipment(rs.getString("equipment"));
      bed.setAssignedPatientId(rs.getString("assigned_patient_id"));

      if (rs.getTimestamp("reservation_start_time") != null) {
        bed.setReservationStartTime(rs.getTimestamp("reservation_start_time").toLocalDateTime());
      }
      if (rs.getTimestamp("reservation_end_time") != null) {
        bed.setReservationEndTime(rs.getTimestamp("reservation_end_time").toLocalDateTime());
      }
      if (rs.getTimestamp("created_at") != null) {
        bed.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
      }
      if (rs.getTimestamp("updated_at") != null) {
        bed.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
      }

      return bed;
    }
  };

  public ICUBed save(ICUBed bed) {
    if (bed.getId() == null) {
      // Create new bed
      bed.setId(UUID.randomUUID().toString());
      bed.setCreatedAt(LocalDateTime.now());
      bed.setUpdatedAt(LocalDateTime.now());

      String sql = """
          INSERT INTO icu_beds (id, bed_number, hospital, hospital_address, icu_type,
                              status, daily_rate, equipment, assigned_patient_id,
                              reservation_start_time, reservation_end_time, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          """;

      jdbcTemplate.update(sql,
          bed.getId(), bed.getBedNumber(), bed.getHospital(), bed.getHospitalAddress(),
          bed.getIcuType(), bed.getStatus(), bed.getDailyRate(), bed.getEquipment(),
          bed.getAssignedPatientId(), bed.getReservationStartTime(), bed.getReservationEndTime(),
          bed.getCreatedAt(), bed.getUpdatedAt());
    } else {
      // Update existing bed
      bed.setUpdatedAt(LocalDateTime.now());

      String sql = """
          UPDATE icu_beds SET bed_number = ?, hospital = ?, hospital_address = ?,
                            icu_type = ?, status = ?, daily_rate = ?, equipment = ?,
                            assigned_patient_id = ?, reservation_start_time = ?,
                            reservation_end_time = ?, updated_at = ?
          WHERE id = ?
          """;

      jdbcTemplate.update(sql,
          bed.getBedNumber(), bed.getHospital(), bed.getHospitalAddress(),
          bed.getIcuType(), bed.getStatus(), bed.getDailyRate(), bed.getEquipment(),
          bed.getAssignedPatientId(), bed.getReservationStartTime(), bed.getReservationEndTime(),
          bed.getUpdatedAt(), bed.getId());
    }
    return bed;
  }

  public Optional<ICUBed> findById(String id) {
    try {
      String sql = "SELECT * FROM icu_beds WHERE id = ?";
      ICUBed bed = jdbcTemplate.queryForObject(sql, icuBedRowMapper, id);
      return Optional.of(bed);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  public List<ICUBed> findAll() {
    String sql = "SELECT * FROM icu_beds ORDER BY hospital, bed_number";
    return jdbcTemplate.query(sql, icuBedRowMapper);
  }

  public List<ICUBed> findByStatus(String status) {
    String sql = "SELECT * FROM icu_beds WHERE status = ? ORDER BY hospital, bed_number";
    return jdbcTemplate.query(sql, icuBedRowMapper, status);
  }

  public List<ICUBed> findByHospital(String hospital) {
    String sql = "SELECT * FROM icu_beds WHERE hospital = ? ORDER BY bed_number";
    return jdbcTemplate.query(sql, icuBedRowMapper, hospital);
  }

  public List<ICUBed> findByIcuType(String icuType) {
    String sql = "SELECT * FROM icu_beds WHERE icu_type = ? ORDER BY hospital, bed_number";
    return jdbcTemplate.query(sql, icuBedRowMapper, icuType);
  }

  public List<ICUBed> findAvailableBeds() {
    String sql = "SELECT * FROM icu_beds WHERE status = 'available' ORDER BY hospital, bed_number";
    return jdbcTemplate.query(sql, icuBedRowMapper);
  }

  public List<ICUBed> findByPatientId(String patientId) {
    String sql = "SELECT * FROM icu_beds WHERE assigned_patient_id = ?";
    return jdbcTemplate.query(sql, icuBedRowMapper, patientId);
  }

  public void deleteById(String id) {
    String sql = "DELETE FROM icu_beds WHERE id = ?";
    jdbcTemplate.update(sql, id);
  }

  public long count() {
    String sql = "SELECT COUNT(*) FROM icu_beds";
    Long count = jdbcTemplate.queryForObject(sql, Long.class);
    return count != null ? count : 0;
  }

  public long countByStatus(String status) {
    String sql = "SELECT COUNT(*) FROM icu_beds WHERE status = ?";
    Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
    return count != null ? count : 0;
  }

  public List<String> findDistinctHospitals() {
    String sql = "SELECT DISTINCT hospital FROM icu_beds ORDER BY hospital";
    return jdbcTemplate.queryForList(sql, String.class);
  }

  public List<String> findDistinctIcuTypes() {
    String sql = "SELECT DISTINCT icu_type FROM icu_beds ORDER BY icu_type";
    return jdbcTemplate.queryForList(sql, String.class);
  }
}
