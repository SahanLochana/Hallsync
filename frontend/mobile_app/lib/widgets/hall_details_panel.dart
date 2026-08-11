import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/hall.dart';
import '../config.dart';
import 'facility_icon.dart';

class HallDetailsPanel extends StatelessWidget {
  final Hall? hall;
  final Future<void> Function(Hall hall)? onBookNow;

  const HallDetailsPanel({super.key, this.hall, this.onBookNow});

  @override
  Widget build(BuildContext context) {
    if (hall == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.info_outline,
              size: 48,
              color: const Color(0xFFD1D5DB),
            ),
            const SizedBox(height: 16),
            const Text(
              'Select a hall to view details',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF9CA3AF),
              ),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: () {},
                  child: const Icon(
                    Icons.arrow_back,
                    color: Color(0xFF1E5AA8),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '${hall!.hallName} Details',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              hall!.hallName,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Capacity: ${hall!.capacity} students',
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'KEY FACILITIES',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: hall!.facilities
                  .map((facility) => FacilityIcon(
                        iconName: facility.icon,
                        label: facility.name,
                        size: 60,
                      ))
                  .toList(),
            ),
            const SizedBox(height: 28),
            const Text(
              'LOCATION',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Color(0xFF6B7280),
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  border: Border.all(color: const Color(0xFFD1D5DB)),
                ),
                child: _buildMapImage(),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              hall!.location.address,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF6B7280),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final lat = hall!.location.latitude;
                  final lng = hall!.location.longitude;
                  final query = (lat != 0.0 && lng != 0.0)
                      ? '$lat,$lng'
                      : Uri.encodeComponent(hall!.location.address);
                  final url = Uri.parse(
                    'https://www.google.com/maps/search/?api=1&query=$query',
                  );
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  } else if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Could not open Google Maps')),
                    );
                  }
                },
                icon: const Icon(Icons.map),
                label: const Text('Open in Google Maps'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E5AA8),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 28),
            _detailRow('Hall Code', hall!.hallCode),
            _detailRow('Building', hall!.building),
            _detailRow('Floor', 'Floor ${hall!.floor}'),
            _detailRow('Seating Arrangements', '${hall!.seatingArrangements} seats'),
            _detailRow(
              'Availability',
              hall!.isAvailable ? 'Available' : 'Unavailable',
            ),
            const SizedBox(height: 28),

            // Book Now — now calls the real backend via the onBookNow callback
            // passed in from HallBookingScreen, instead of just a snackbar.
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: !hall!.isAvailable
                    ? null
                    : () async {
                        if (onBookNow != null) {
                          await onBookNow!(hall!);
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E5AA8),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: const Color(0xFFD1D5DB),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  hall!.isAvailable ? 'Book Now' : 'Unavailable',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Shows a real Google Static Map centered on the hall's coordinates.
  /// Falls back to a simple pin+address placeholder if no API key is
  /// configured yet, or if the image fails to load — so the UI never
  /// shows a broken-image icon during your demo.
  Widget _buildMapImage() {
    final lat = hall!.location.latitude;
    final lng = hall!.location.longitude;
    final hasCoordinates = lat != 0.0 && lng != 0.0;
    final hasApiKey = AppConfig.googleMapsApiKey.isNotEmpty;

    if (hasCoordinates && hasApiKey) {
      final mapUrl = 'https://maps.googleapis.com/maps/api/staticmap'
          '?center=$lat,$lng'
          '&zoom=16'
          '&size=600x400'
          '&scale=2'
          '&markers=color:blue%7C$lat,$lng'
          '&key=${AppConfig.googleMapsApiKey}';

      return Image.network(
        mapUrl,
        fit: BoxFit.cover,
        loadingBuilder: (context, child, progress) {
          if (progress == null) return child;
          return const Center(child: CircularProgressIndicator(color: Color(0xFF1E5AA8)));
        },
        errorBuilder: (context, error, stackTrace) => _mapFallback(),
      );
    }

    return _mapFallback();
  }

  Widget _mapFallback() {
    return Stack(
      children: [
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.location_on,
                size: 40,
                color: Color(0xFF1E5AA8),
              ),
              const SizedBox(height: 8),
              Text(
                hall!.location.address,
                style: const TextStyle(
                  fontSize: 12,
                  color: Color(0xFF6B7280),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Positioned(
          bottom: 16,
          right: 16,
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: const Color(0xFF1E5AA8),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.location_on,
              color: Colors.white,
              size: 20,
            ),
          ),
        ),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF6B7280),
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }
}
