import 'package:flutter/material.dart';
import '../models/hall.dart';

class HallCard extends StatelessWidget {
  final Hall hall;
  final bool isSelected;
  final VoidCallback onTap;
  final ValueChanged<bool> onFavoriteChanged;

  const HallCard({
    super.key,
    required this.hall,
    required this.isSelected,
    required this.onTap,
    required this.onFavoriteChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8EEFB) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF1E5AA8) : const Color(0xFFE5E7EB),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hall.hallName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        hall.building,
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF9CA3AF),
                        ),
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    onFavoriteChanged(!hall.isFavorite);
                  },
                  child: Icon(
                    hall.isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: hall.isFavorite ? Colors.red : const Color(0xFFD1D5DB),
                    size: 20,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: hall.isAvailable ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                hall.isAvailable ? 'Available' : 'Unavailable',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: hall.isAvailable ? const Color(0xFF059669) : const Color(0xFFDC2626),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _facilityStat(Icons.event_seat, 'Seating\n${hall.seatingArrangements}'),
                _facilityStat(Icons.people, 'Capacity\n${hall.capacity}'),
                _facilityStat(Icons.layers, 'Floor\n${hall.floor}'),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Wrap(
                  spacing: 4,
                  children: [
                    for (int i = 0; i < 3 && i < hall.facilities.length; i++)
                      Tooltip(
                        message: hall.facilities[i].name,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: const Color(0xFFE8EEFB),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Icon(
                            _getIconData(hall.facilities[i].icon),
                            size: 12,
                            color: const Color(0xFF1E5AA8),
                          ),
                        ),
                      ),
                  ],
                ),
                Text(
                  hall.hallCode,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 36,
              child: OutlinedButton(
                onPressed: onTap,
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF1E5AA8),
                  side: const BorderSide(color: Color(0xFF1E5AA8)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'View on Map',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _facilityStat(IconData icon, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF6B7280)),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            color: Color(0xFF6B7280),
          ),
        ),
      ],
    );
  }

  IconData _getIconData(String name) {
    switch (name.toLowerCase()) {
      case 'wifi':
        return Icons.wifi;
      case 'projector':
        return Icons.screenshare;
      case 'ac':
        return Icons.ac_unit;
      default:
        return Icons.info;
    }
  }
}
