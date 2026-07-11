import 'package:flutter/material.dart';

IconData getFacilityIconData(String name) {
  switch (name.toLowerCase()) {
    case 'wifi':
      return Icons.wifi;
    case 'projector':
      return Icons.present_to_all;
    case 'ac':
      return Icons.ac_unit;
    case 'parking':
      return Icons.local_parking;
    case 'food':
      return Icons.restaurant;
    case 'restroom':
      return Icons.wc;
    default:
      return Icons.info;
  }
}

class FacilityIcon extends StatelessWidget {
  final String iconName;
  final String label;
  final double size;

  const FacilityIcon({
    super.key,
    required this.iconName,
    required this.label,
    this.size = 50,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color: const Color(0xFFE8EEFB),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            getFacilityIconData(iconName),
            color: const Color(0xFF1E5AA8),
            size: size * 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
