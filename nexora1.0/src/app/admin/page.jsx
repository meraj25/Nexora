"use client";
import { useState } from "react";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    collection: "schedules",
    documentId: "",
    action: "add",
    batch: "",
    date: "",
    lectureHall: "",
    lecturerName: "",
    subject: "",
    time: "",
    breakfast: "",
    lunch: "",
    dinner: "",
    routeName: "",
    departureTime: "",
    arrivalTime: "",
    eventName: "",
    eventDate: "",
    eventTime: "",
    location: "",
    briefInfo: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {};

    switch (formData.collection) {
      case "schedules":
        dataToSend.batch = formData.batch;
        dataToSend.date = formData.date;
        dataToSend.lectureHall = formData.lectureHall;
        dataToSend.lecturerName = formData.lecturerName;
        dataToSend.subject = formData.subject;
        dataToSend.time = formData.time;
        break;
      case "cafeteria_menu":
        dataToSend.breakfast = formData.breakfast.split(",").map((item) => item.trim());
        dataToSend.lunch = formData.lunch.split(",").map((item) => item.trim());
        dataToSend.dinner = formData.dinner.split(",").map((item) => item.trim());
        break;
      case "bus_times":
        dataToSend.routeName = formData.routeName;
        dataToSend.departureTime = formData.departureTime.split(",").map((item) => item.trim());
        dataToSend.arrivalTime = formData.arrivalTime.split(",").map((item) => item.trim());
        break;
      case "events":
        dataToSend.eventName = formData.eventName;
        dataToSend.eventDate = formData.eventDate;
        dataToSend.eventTime = formData.eventTime;
        dataToSend.location = formData.location;
        dataToSend.briefInfo = formData.briefInfo;
        break;
      default:
        setFormData((prev) => ({ ...prev, message: "Invalid collection selected." }));
        return;
    }

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection: formData.collection,
          documentId: formData.documentId,
          action: formData.action,
          data: dataToSend,
        }),
      });
      const result = await res.json();
      setFormData((prev) => ({ ...prev, message: result.message }));
    } catch (error) {
      setFormData((prev) => ({ ...prev, message: "Error: " + error.message }));
    }
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <form onSubmit={handleSubmit}>
        <select name="collection" value={formData.collection} onChange={handleChange}>
          <option value="schedules">Schedules</option>
          <option value="cafeteria_menu">Cafeteria Menu</option>
          <option value="bus_times">Bus Times</option>
          <option value="events">Events</option>
        </select>

        <select name="action" value={formData.action} onChange={handleChange}>
          <option value="add">Add/Update</option>
          <option value="delete">Delete</option>
        </select>

        <input
          type="text"
          name="documentId"
          value={formData.documentId}
          onChange={handleChange}
          placeholder="Document ID (e.g., BSc_Computer_Science, Wednesday)"
          required
        />

        {formData.collection === "schedules" && (
  <>
    <input
      type="text"
      name="batch"
      value={formData.batch}
      onChange={handleChange}
      placeholder="Batch (e.g., 23.2)" // Updated from "23-2"
      required
    />
    <input
      type="text"
      name="date"
      value={formData.date}
      onChange={handleChange}
      placeholder="Date (e.g., June 11, 2025)"
      required
    />
    <input
      type="text"
      name="lectureHall"
      value={formData.lectureHall}
      onChange={handleChange}
      placeholder="Lecture Hall (e.g., A101)"
      required
    />
    <input
      type="text"
      name="lecturerName"
      value={formData.lecturerName}
      onChange={handleChange}
      placeholder="Lecturer Name (e.g., Dr. John Doe)"
      required
    />
    <input
      type="text"
      name="subject"
      value={formData.subject}
      onChange={handleChange}
      placeholder="Subject (e.g., Programming in C)"
      required
    />
    <input
      type="text"
      name="time"
      value={formData.time}
      onChange={handleChange}
      placeholder="Time (e.g., 9:00 am)"
      required
    />
  </>
)}

        {formData.collection === "cafeteria_menu" && (
          <>
            <input
              type="text"
              name="breakfast"
              value={formData.breakfast}
              onChange={handleChange}
              placeholder="Breakfast (comma-separated, e.g., toast, eggs)"
              required
            />
            <input
              type="text"
              name="lunch"
              value={formData.lunch}
              onChange={handleChange}
              placeholder="Lunch (comma-separated, e.g., rice, curry)"
              required
            />
            <input
              type="text"
              name="dinner"
              value={formData.dinner}
              onChange={handleChange}
              placeholder="Dinner (comma-separated, e.g., noodles, soup)"
              required
            />
          </>
        )}

        {formData.collection === "bus_times" && (
          <>
            <input
              type="text"
              name="routeName"
              value={formData.routeName}
              onChange={handleChange}
              placeholder="Route Name (e.g., Campus-Main)"
              required
            />
            <input
              type="text"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              placeholder="Departure Times (comma-separated, e.g., 8:00 am, 5:00 pm)"
              required
            />
            <input
              type="text"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              placeholder="Arrival Times (comma-separated, e.g., 8:30 am, 5:30 pm)"
              required
            />
          </>
        )}

        {formData.collection === "events" && (
          <>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Event Name (e.g., Tech Fest)"
              required
            />
            <input
              type="text"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              placeholder="Event Date (e.g., June 12, 2025)"
              required
            />
            <input
              type="text"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              placeholder="Event Time (e.g., 2:00 pm)"
              required
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location (e.g., Hall A)"
              required
            />
            <input
              type="text"
              name="briefInfo"
              value={formData.briefInfo}
              onChange={handleChange}
              placeholder="Brief Info (e.g., Free entry)"
              required
            />
          </>
        )}

        <button type="submit">Submit</button>
      </form>
      {formData.message && <p>{formData.message}</p>}
    </div>
  );
}