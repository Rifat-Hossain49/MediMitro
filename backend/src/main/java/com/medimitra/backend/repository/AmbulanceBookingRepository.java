package com.medimitra.backend.repository;

import com.medimitra.backend.model.AmbulanceBooking;
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
public class AmbulanceBookingRepository {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  private final RowMapper<AmbulanceBooking> bookingRowMapper = new RowMapper<AmbulanceBooking>() {
    @Override
    public AmbulanceBooking mapRow(ResultSet rs, int rowNum) throws SQLException {
      AmbulanceBooking booking = new AmbulanceBooking();
      booking.setId(rs.getString("id"));
      booking.setPatientId(rs.getString("patient_id"));
      booking.setEmergencyType(rs.getString("emergency_type"));
      booking.setPriority(rs.getString("priority"));
      booking.setPickupAddress(rs.getString("pickup_address"));
      booking.setPickupLatitude(rs.getString("pickup_latitude"));
      booking.setPickupLongitude(rs.getString("pickup_longitude"));
      booking.setDestination(rs.getString("destination"));
      booking.setDestinationLatitude(rs.getString("destination_latitude"));
      booking.setDestinationLongitude(rs.getString("destination_longitude"));
      booking.setContactPhone(rs.getString("contact_phone"));
      booking.setSymptoms(rs.getString("symptoms"));
      booking.setAdditionalInfo(rs.getString("additional_info"));
      booking.setStatus(rs.getString("status"));
      booking.setAmbulanceId(rs.getString("ambulance_id"));
      booking.setDriverId(rs.getString("driver_id"));
      booking.setParamedicsIds(rs.getString("paramedics_ids"));
      booking.setEstimatedCost(rs.getBigDecimal("estimated_cost"));
      booking.setFinalCost(rs.getBigDecimal("final_cost"));
      booking.setEstimatedArrivalMinutes(rs.getObject("estimated_arrival_minutes", Integer.class));
      booking.setCancellationReason(rs.getString("cancellation_reason"));

      if (rs.getTimestamp("request_time") != null) {
        booking.setRequestTime(rs.getTimestamp("request_time").toLocalDateTime());
      }
      if (rs.getTimestamp("dispatch_time") != null) {
        booking.setDispatchTime(rs.getTimestamp("dispatch_time").toLocalDateTime());
      }
      if (rs.getTimestamp("arrival_time") != null) {
        booking.setArrivalTime(rs.getTimestamp("arrival_time").toLocalDateTime());
      }
      if (rs.getTimestamp("completion_time") != null) {
        booking.setCompletionTime(rs.getTimestamp("completion_time").toLocalDateTime());
      }
      if (rs.getTimestamp("created_at") != null) {
        booking.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
      }
      if (rs.getTimestamp("updated_at") != null) {
        booking.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
      }

      return booking;
    }
  };

  public AmbulanceBooking save(AmbulanceBooking booking) {
    if (booking.getId() == null) {
      // Create new booking
      booking.setId(UUID.randomUUID().toString());
      booking.setRequestTime(LocalDateTime.now());
      booking.setCreatedAt(LocalDateTime.now());
      booking.setUpdatedAt(LocalDateTime.now());

      String sql = """
          INSERT INTO ambulance_bookings (id, patient_id, emergency_type, priority,
                                        pickup_address, pickup_latitude, pickup_longitude,
                                        destination, destination_latitude, destination_longitude,
                                        contact_phone, symptoms, additional_info, status,
                                        ambulance_id, driver_id, paramedics_ids,
                                        estimated_cost, final_cost, request_time, dispatch_time,
                                        arrival_time, completion_time, estimated_arrival_minutes,
                                        cancellation_reason, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          """;

      jdbcTemplate.update(sql,
          booking.getId(), booking.getPatientId(), booking.getEmergencyType(), booking.getPriority(),
          booking.getPickupAddress(), booking.getPickupLatitude(), booking.getPickupLongitude(),
          booking.getDestination(), booking.getDestinationLatitude(), booking.getDestinationLongitude(),
          booking.getContactPhone(), booking.getSymptoms(), booking.getAdditionalInfo(), booking.getStatus(),
          booking.getAmbulanceId(), booking.getDriverId(), booking.getParamedicsIds(),
          booking.getEstimatedCost(), booking.getFinalCost(), booking.getRequestTime(), booking.getDispatchTime(),
          booking.getArrivalTime(), booking.getCompletionTime(), booking.getEstimatedArrivalMinutes(),
          booking.getCancellationReason(), booking.getCreatedAt(), booking.getUpdatedAt());
    } else {
      // Update existing booking
      booking.setUpdatedAt(LocalDateTime.now());

      String sql = """
          UPDATE ambulance_bookings SET patient_id = ?, emergency_type = ?, priority = ?,
                                      pickup_address = ?, pickup_latitude = ?, pickup_longitude = ?,
                                      destination = ?, destination_latitude = ?, destination_longitude = ?,
                                      contact_phone = ?, symptoms = ?, additional_info = ?, status = ?,
                                      ambulance_id = ?, driver_id = ?, paramedics_ids = ?,
                                      estimated_cost = ?, final_cost = ?, request_time = ?, dispatch_time = ?,
                                      arrival_time = ?, completion_time = ?, estimated_arrival_minutes = ?,
                                      cancellation_reason = ?, updated_at = ?
          WHERE id = ?
          """;

      jdbcTemplate.update(sql,
          booking.getPatientId(), booking.getEmergencyType(), booking.getPriority(),
          booking.getPickupAddress(), booking.getPickupLatitude(), booking.getPickupLongitude(),
          booking.getDestination(), booking.getDestinationLatitude(), booking.getDestinationLongitude(),
          booking.getContactPhone(), booking.getSymptoms(), booking.getAdditionalInfo(), booking.getStatus(),
          booking.getAmbulanceId(), booking.getDriverId(), booking.getParamedicsIds(),
          booking.getEstimatedCost(), booking.getFinalCost(), booking.getRequestTime(), booking.getDispatchTime(),
          booking.getArrivalTime(), booking.getCompletionTime(), booking.getEstimatedArrivalMinutes(),
          booking.getCancellationReason(), booking.getUpdatedAt(), booking.getId());
    }
    return booking;
  }

  public Optional<AmbulanceBooking> findById(String id) {
    try {
      String sql = "SELECT * FROM ambulance_bookings WHERE id = ?";
      AmbulanceBooking booking = jdbcTemplate.queryForObject(sql, bookingRowMapper, id);
      return Optional.of(booking);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  public List<AmbulanceBooking> findAll() {
    String sql = "SELECT * FROM ambulance_bookings ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper);
  }

  public List<AmbulanceBooking> findByPatientId(String patientId) {
    String sql = "SELECT * FROM ambulance_bookings WHERE patient_id = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, patientId);
  }

  public List<AmbulanceBooking> findByStatus(String status) {
    String sql = "SELECT * FROM ambulance_bookings WHERE status = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, status);
  }

  public List<AmbulanceBooking> findByPriority(String priority) {
    String sql = "SELECT * FROM ambulance_bookings WHERE priority = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, priority);
  }

  public List<AmbulanceBooking> findActiveBookings() {
    String sql = """
        SELECT * FROM ambulance_bookings
        WHERE status IN ('requested', 'dispatched', 'en_route', 'arrived')
        ORDER BY
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                WHEN 'low' THEN 4
            END, request_time ASC
        """;
    return jdbcTemplate.query(sql, bookingRowMapper);
  }

  public List<AmbulanceBooking> findByEmergencyType(String emergencyType) {
    String sql = "SELECT * FROM ambulance_bookings WHERE emergency_type = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, emergencyType);
  }

  public List<AmbulanceBooking> findByAmbulanceId(String ambulanceId) {
    String sql = "SELECT * FROM ambulance_bookings WHERE ambulance_id = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, ambulanceId);
  }

  public List<AmbulanceBooking> findByDriverId(String driverId) {
    String sql = "SELECT * FROM ambulance_bookings WHERE driver_id = ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, driverId);
  }

  public List<AmbulanceBooking> findRecentBookings(int limit) {
    String sql = "SELECT * FROM ambulance_bookings ORDER BY request_time DESC LIMIT ?";
    return jdbcTemplate.query(sql, bookingRowMapper, limit);
  }

  public void deleteById(String id) {
    String sql = "DELETE FROM ambulance_bookings WHERE id = ?";
    jdbcTemplate.update(sql, id);
  }

  public long count() {
    String sql = "SELECT COUNT(*) FROM ambulance_bookings";
    Long count = jdbcTemplate.queryForObject(sql, Long.class);
    return count != null ? count : 0;
  }

  public long countByStatus(String status) {
    String sql = "SELECT COUNT(*) FROM ambulance_bookings WHERE status = ?";
    Long count = jdbcTemplate.queryForObject(sql, Long.class, status);
    return count != null ? count : 0;
  }

  public long countByPriority(String priority) {
    String sql = "SELECT COUNT(*) FROM ambulance_bookings WHERE priority = ?";
    Long count = jdbcTemplate.queryForObject(sql, Long.class, priority);
    return count != null ? count : 0;
  }

  public List<AmbulanceBooking> findBookingsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
    String sql = "SELECT * FROM ambulance_bookings WHERE request_time BETWEEN ? AND ? ORDER BY request_time DESC";
    return jdbcTemplate.query(sql, bookingRowMapper, startDate, endDate);
  }
}
