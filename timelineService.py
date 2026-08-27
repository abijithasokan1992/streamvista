import opentimelineio as otio

# Create a new timeline
timeline = otio.schema.Timeline(name="Streamvista Project")

# Create a video track
track = otio.schema.Track(name="Video Track", kind=otio.schema.TrackKind.Video)

# Create a clip with a duration (required for some adapters like FCP XML)
clip = otio.schema.Clip(
    name="Scene1",
    source_range=otio.opentime.TimeRange(
        start_time=otio.opentime.RationalTime(0, 24),
        duration=otio.opentime.RationalTime(120, 24)  # 5 seconds at 24fps
    )
)

# Add clip to track
track.append(clip)

# Add track to timeline
timeline.tracks.append(track)

# Write the timeline to an .otio file
otio.adapters.write_to_file(timeline, "timeline.otio")
print("Timeline created: timeline.otio")

# Export to FCP XML string
xml_data = otio.adapters.write_to_string(
    timeline,
    adapter_name="fcp_xml"
)

print("\n--- FCP XML Output ---")
print(xml_data)
