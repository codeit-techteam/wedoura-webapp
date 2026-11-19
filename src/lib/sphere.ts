"use client";

/**
 * One lazy entry point for Photo Sphere Viewer so the library (three.js
 * included) is downloaded only when a visitor actually opens a 360° photo or
 * steps into a venue tour, and both paths share the same chunks.
 */

export async function loadSphere() {
  const [{ Viewer }, { AutorotatePlugin }, { GyroscopePlugin }] = await Promise.all([
    import("@photo-sphere-viewer/core"),
    import("@photo-sphere-viewer/autorotate-plugin"),
    import("@photo-sphere-viewer/gyroscope-plugin"),
  ]);
  await import("@photo-sphere-viewer/core/index.css");
  return { Viewer, AutorotatePlugin, GyroscopePlugin };
}

export async function loadTour() {
  const [base, { VirtualTourPlugin }, { MarkersPlugin }] = await Promise.all([
    loadSphere(),
    import("@photo-sphere-viewer/virtual-tour-plugin"),
    import("@photo-sphere-viewer/markers-plugin"),
  ]);
  await Promise.all([
    import("@photo-sphere-viewer/virtual-tour-plugin/index.css"),
    import("@photo-sphere-viewer/markers-plugin/index.css"),
  ]);
  return { ...base, VirtualTourPlugin, MarkersPlugin };
}
