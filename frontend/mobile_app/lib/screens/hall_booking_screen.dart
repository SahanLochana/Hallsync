import 'package:flutter/material.dart';
import '../models/hall.dart';
import '../services/api_service.dart';
import '../widgets/hall_card.dart';
import '../widgets/hall_details_panel.dart';

class HallBookingScreen extends StatefulWidget {
  const HallBookingScreen({super.key});

  @override
  State<HallBookingScreen> createState() => _HallBookingScreenState();
}

class _HallBookingScreenState extends State<HallBookingScreen> {
  List<Hall> _halls = [];
  List<Hall> _filteredHalls = [];
  Hall? _selectedHall;
  final _searchController = TextEditingController();

  bool _isLoading = true;
  String? _errorMessage;

  static const Color primaryBlue = Color(0xFF1E5AA8);
  static const Color backgroundColor = Color(0xFFF4F7FB);

  @override
  void initState() {
    super.initState();
    _loadHalls();
  }

  Future<void> _loadHalls() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await ApiService.fetchHalls();
      final halls = data.map((json) => Hall.fromJson(json)).toList();
      setState(() {
        _halls = halls;
        _filteredHalls = List.from(halls);
        _selectedHall = halls.isNotEmpty ? halls.first : null;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _searchHalls(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredHalls = List.from(_halls);
      } else {
        _filteredHalls = _halls
            .where((hall) =>
                hall.hallName.toLowerCase().contains(query.toLowerCase()) ||
                hall.hallCode.toLowerCase().contains(query.toLowerCase()) ||
                hall.building.toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  // Favorites are local-only for now (not persisted to the backend).
  void _toggleFavorite(Hall hall) {
    setState(() {
      final index = _halls.indexWhere((h) => h.id == hall.id);
      if (index != -1) {
        _halls[index] = _halls[index].copyWith(isFavorite: !_halls[index].isFavorite);
        final filteredIndex = _filteredHalls.indexWhere((h) => h.id == hall.id);
        if (filteredIndex != -1) {
          _filteredHalls[filteredIndex] = _filteredHalls[filteredIndex].copyWith(
            isFavorite: !_filteredHalls[filteredIndex].isFavorite,
          );
        }
        if (_selectedHall?.id == hall.id) {
          _selectedHall = _halls[index];
        }
      }
    });
  }

  void _selectHall(Hall hall) {
    setState(() {
      _selectedHall = hall;
    });
  }

  Future<void> _bookHall(Hall hall) async {
    final now = DateTime.now();
    final date =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';

    try {
      await ApiService.createBooking(
        hallId: int.parse(hall.id),
        date: date,
        startTime: '09:00:00',
        endTime: '10:00:00',
        purpose: 'Booked via app',
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${hall.hallName} booked successfully!')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Booking failed: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 768;

    if (_isLoading) {
      return const Scaffold(
        backgroundColor: backgroundColor,
        body: Center(child: CircularProgressIndicator(color: primaryBlue)),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: backgroundColor,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.wifi_off, size: 48, color: Color(0xFFD1D5DB)),
                const SizedBox(height: 12),
                Text(
                  'Could not load halls.\n$_errorMessage',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadHalls,
                  style: ElevatedButton.styleFrom(backgroundColor: primaryBlue, foregroundColor: Colors.white),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: isMobile ? _buildMobileLayout() : _buildTabletLayout(),
      ),
    );
  }

  Widget _buildMobileLayout() {
    if (_selectedHall != null) {
      return Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedHall = null;
                    });
                  },
                  child: const Icon(
                    Icons.arrow_back,
                    color: primaryBlue,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Hall Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: HallDetailsPanel(hall: _selectedHall, onBookNow: _bookHall),
          ),
        ],
      );
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'halls',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 16),
              _buildSearchBar(),
            ],
          ),
        ),
        Expanded(
          child: _filteredHalls.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.search_off,
                        size: 48,
                        color: const Color(0xFFD1D5DB),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'No halls found',
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF9CA3AF),
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _filteredHalls.length,
                  itemBuilder: (context, index) {
                    final hall = _filteredHalls[index];
                    return HallCard(
                      hall: hall,
                      isSelected: _selectedHall?.id == hall.id,
                      onTap: () => _selectHall(hall),
                      onFavoriteChanged: (isFavorite) => _toggleFavorite(hall),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildTabletLayout() {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: Container(
            color: Colors.white,
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'halls',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildSearchBar(),
                    ],
                  ),
                ),
                Expanded(
                  child: _filteredHalls.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.search_off,
                                size: 48,
                                color: const Color(0xFFD1D5DB),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'No halls found',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF9CA3AF),
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount: _filteredHalls.length,
                          itemBuilder: (context, index) {
                            final hall = _filteredHalls[index];
                            return HallCard(
                              hall: hall,
                              isSelected: _selectedHall?.id == hall.id,
                              onTap: () => _selectHall(hall),
                              onFavoriteChanged: (isFavorite) =>
                                  _toggleFavorite(hall),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
        Container(
          width: 1,
          color: const Color(0xFFE5E7EB),
        ),
        Expanded(
          flex: 1,
          child: Container(
            color: backgroundColor,
            child: HallDetailsPanel(hall: _selectedHall, onBookNow: _bookHall),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: _searchHalls,
        decoration: InputDecoration(
          hintText: 'Search halls...',
          hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
          prefixIcon: const Icon(
            Icons.search,
            color: Color(0xFF9CA3AF),
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? GestureDetector(
                  onTap: () {
                    _searchController.clear();
                    _searchHalls('');
                  },
                  child: const Icon(
                    Icons.close,
                    color: Color(0xFF9CA3AF),
                  ),
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }
}
