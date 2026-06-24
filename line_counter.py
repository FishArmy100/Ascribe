#!/usr/bin/env python3
"""
Line counter for the project, respecting .gitignore patterns.
Counts total lines of code excluding ignored files and directories.
"""

import os
import fnmatch
import sys
from pathlib import Path
from typing import Set, Tuple
from datetime import datetime

def parse_gitignore(gitignore_path: str) -> Set[str]:
    """Parse .gitignore file and return set of patterns to exclude."""
    patterns = set()
    
    if not os.path.exists(gitignore_path):
        return patterns
    
    with open(gitignore_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.rstrip('\n').strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            patterns.add(line)
    
    return patterns


def should_ignore(path: str, patterns: Set[str], base_path: str) -> bool:
    """Check if a path should be ignored based on gitignore patterns."""
    # Get relative path from base
    rel_path = os.path.relpath(path, base_path)
    
    for pattern in patterns:
        pattern = pattern.strip()
        if not pattern:
            continue
        
        # Handle directory patterns (ending with /)
        if pattern.endswith('/'):
            dir_pattern = pattern.rstrip('/')
            if rel_path.startswith(dir_pattern + os.sep) or rel_path == dir_pattern:
                return True
            # Also check each component
            path_parts = rel_path.split(os.sep)
            if dir_pattern in path_parts:
                return True
        # Handle patterns with wildcards
        elif '*' in pattern or '?' in pattern:
            # Check against the full relative path
            if fnmatch.fnmatch(rel_path, pattern):
                return True
            # Also check just the filename
            if fnmatch.fnmatch(os.path.basename(path), pattern):
                return True
        # Handle exact matches
        else:
            if rel_path == pattern or rel_path.startswith(pattern + os.sep):
                return True
            if os.path.basename(path) == pattern:
                return True
    
    return False


def is_text_file(file_path: str) -> bool:
    """Determine if a file is likely a text file."""
    # List of common text file extensions
    text_extensions = {
        '.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.html', '.css', '.scss',
        '.md', '.txt', '.yml', '.yaml', '.toml', '.xml', '.rs', '.cpp', '.c',
        '.h', '.hpp', '.java', '.go', '.rb', '.php', '.sql', '.sh', '.bash',
        '.env', '.conf', '.config', '.gitignore', '.eslintrc', '.prettierrc'
    }
    
    _, ext = os.path.splitext(file_path)
    if ext.lower() in text_extensions:
        return True
    
    # Check if it's a file without extension that might be text
    basename = os.path.basename(file_path)
    text_files = {
        'Dockerfile', 'Makefile', 'Cargo.toml', 'Cargo.lock', 'package.json',
        'tsconfig.json', 'vite.config.ts', '.gitignore', 'LICENSE', 'README',
        'build.rs'
    }
    if basename in text_files or basename.startswith('README') or basename.startswith('LICENSE'):
        return True
    
    return False


def count_lines(file_path: str) -> int:
    """Count lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return sum(1 for _ in f)
    except (IOError, OSError):
        return 0


def print_progress(current: int, file_name: str):
    """Print progress indicator in terminal."""
    sys.stdout.write(f"\rProcessing file {current:4d}: {file_name[:60]:<60}")
    sys.stdout.flush()


def count_project_lines(project_path: str = '.') -> Tuple[int, int, int, list]:
    """
    Count all lines in the project, excluding gitignore patterns.
    Returns: (total_lines, total_files, total_directories, file_details)
    """
    gitignore_path = os.path.join(project_path, '.gitignore')
    ignore_patterns = parse_gitignore(gitignore_path)
    
    total_lines = 0
    total_files = 0
    total_dirs = 0
    file_details = []
    file_count = 0
    
    print("Scanning files...")
    
    for root, dirs, files in os.walk(project_path):
        # Filter out ignored directories
        dirs_to_remove = []
        for d in dirs:
            dir_path = os.path.join(root, d)
            if should_ignore(dir_path, ignore_patterns, project_path):
                dirs_to_remove.append(d)
        
        for d in dirs_to_remove:
            dirs.remove(d)
        
        total_dirs += len(dirs)
        
        # Process files
        for file in files:
            file_path = os.path.join(root, file)
            
            if should_ignore(file_path, ignore_patterns, project_path):
                continue
            
            if not is_text_file(file_path):
                continue
            
            file_count += 1
            rel_path = os.path.relpath(file_path, project_path)
            print_progress(file_count, rel_path)
            
            lines = count_lines(file_path)
            if lines > 0:
                total_lines += lines
                total_files += 1
                file_details.append((rel_path, lines))
    
    # Clear the progress line
    sys.stdout.write("\r" + " " * 100 + "\r")
    sys.stdout.flush()
    
    return total_lines, total_files, total_dirs, file_details


def generate_html_report(project_path: str, files_by_type: dict, total_lines: int, total_files: int, total_dirs: int):
    """Generate an HTML report of the line count analysis."""
    
    # Sort by line count descending
    sorted_types = sorted(
        files_by_type.items(),
        key=lambda x: x[1]['lines'],
        reverse=True
    )
    
    # Generate table rows
    table_rows = ""
    for file_type, stats in sorted_types:
        table_rows += f"""
        <tr>
            <td>{file_type}</td>
            <td>{stats['count']:,}</td>
            <td>{stats['lines']:,}</td>
            <td><div class="bar" style="width: {(stats['lines'] / total_lines * 100)}%"></div></td>
        </tr>
        """
    
    # Generate chart data
    chart_labels = [f"'{ft}'" for ft, _ in sorted_types]
    chart_data = [stats['lines'] for _, stats in sorted_types]
    file_counts = [stats['count'] for _, stats in sorted_types]
    
    labels_js = '[' + ', '.join(chart_labels) + ']'
    data_js = '[' + ', '.join(str(d) for d in chart_data) + ']'
    counts_js = '[' + ', '.join(str(c) for c in file_counts) + ']'
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Line Counter Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
            letter-spacing: 1px;
        }}
        
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
            word-break: break-all;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}
        
        .stat-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }}
        
        .stat-card:hover {{
            transform: translateY(-5px);
        }}
        
        .stat-card .value {{
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        
        .stat-card .label {{
            font-size: 0.95em;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .section {{
            margin-bottom: 40px;
        }}
        
        .section h2 {{
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}
        
        .charts-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }}
        
        .chart-container {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }}
        
        .chart-container canvas {{
            max-height: 400px;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }}
        
        thead {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }}
        
        th {{
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }}
        
        td {{
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
        }}
        
        tbody tr:hover {{
            background: #f0f0f0;
        }}
        
        tbody tr:last-child td {{
            border-bottom: none;
        }}
        
        .bar {{
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            height: 8px;
            border-radius: 4px;
            min-height: 8px;
        }}
        
        .footer {{
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #e0e0e0;
        }}
        
        @media (max-width: 768px) {{
            .header h1 {{
                font-size: 2em;
            }}
            
            .charts-grid {{
                grid-template-columns: 1fr;
            }}
            
            .stat-card .value {{
                font-size: 2em;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Project Line Counter</h1>
            <p>"Ascribe"</p>
        </div>
        
        <div class="content">
            <div class="stats">
                <div class="stat-card">
                    <div class="value">{total_lines:,}</div>
                    <div class="label">Total Lines</div>
                </div>
                <div class="stat-card">
                    <div class="value">{total_files:,}</div>
                    <div class="label">Files Counted</div>
                </div>
                <div class="stat-card">
                    <div class="value">{len(files_by_type):,}</div>
                    <div class="label">File Types</div>
                </div>
                <div class="stat-card">
                    <div class="value">{total_dirs:,}</div>
                    <div class="label">Directories</div>
                </div>
            </div>
            
            <div class="section">
                <h2>📈 Analysis</h2>
                <div class="charts-grid">
                    <div class="chart-container">
                        <canvas id="lineChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="filesChart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Breakdown by File Type</h2>
                <table>
                    <thead>
                        <tr>
                            <th>File Type</th>
                            <th>Count</th>
                            <th>Lines</th>
                            <th>Distribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_rows}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | Line counter v1.0</p>
        </div>
    </div>
    
    <script>
        // Chart configuration
        const ctx1 = document.getElementById('lineChart').getContext('2d');
        const ctx2 = document.getElementById('filesChart').getContext('2d');
        
        const labels = {labels_js};
        const lineData = {data_js};
        const fileCountData = {counts_js};
        
        new Chart(ctx1, {{
            type: 'doughnut',
            data: {{
                labels: labels,
                datasets: [{{
                    data: lineData,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
                        '#fa709a', '#fee140', '#30cfd0', '#a8edea', '#fed6e3',
                        '#ff9a56', '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{
                            padding: 15,
                            font: {{size: 12}}
                        }}
                    }}
                }}
            }}
        }});
        
        new Chart(ctx2, {{
            type: 'bar',
            data: {{
                labels: labels,
                datasets: [{{
                    label: 'Number of Files',
                    data: fileCountData,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1,
                    borderRadius: 4
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {{
                    legend: {{
                        display: false
                    }}
                }},
                scales: {{
                    x: {{
                        beginAtZero: true
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>
"""
    
    return html_content


def main():
    """Main entry point."""
    project_path = os.getcwd()
    
    print(f"Counting lines in: {project_path}")
    print("-" * 70)
    
    total_lines, total_files, total_dirs, file_details = count_project_lines(project_path)
    
    # Group files by extension
    files_by_type = {}
    for file_path, lines in file_details:
        _, ext = os.path.splitext(file_path)
        if not ext:
            ext = 'no extension'
        
        if ext not in files_by_type:
            files_by_type[ext] = {'count': 0, 'lines': 0}
        
        files_by_type[ext]['count'] += 1
        files_by_type[ext]['lines'] += lines
    
    # Sort by line count descending
    sorted_types = sorted(
        files_by_type.items(),
        key=lambda x: x[1]['lines'],
        reverse=True
    )
    
    # Display results in terminal
    print("\nLine count by file type:")
    print("=" * 70)
    print(f"{'File Type':<20} {'Files':>10} {'Lines':>15}")
    print("-" * 70)
    
    for file_type, stats in sorted_types:
        print(f"{file_type:<20} {stats['count']:>10,} {stats['lines']:>15,}")
    
    # Terminal Summary
    print("=" * 70)
    print(f"Total lines of code: {total_lines:,}")
    print(f"Total files counted:  {total_files:,}")
    print(f"Total directories:    {total_dirs:,}")
    print(f"File types:           {len(files_by_type):,}")
    print("=" * 70)
    
    # Generate and save HTML report
    print("\nGenerating HTML report...")
    html_content = generate_html_report(project_path, files_by_type, total_lines, total_files, total_dirs)
    
    output_file = os.path.join(project_path, 'docs', 'line_count_report.html')
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Report saved to: {output_file}")
    print(f"  Open it in your browser to view the interactive report.")


if __name__ == '__main__':
    main()
