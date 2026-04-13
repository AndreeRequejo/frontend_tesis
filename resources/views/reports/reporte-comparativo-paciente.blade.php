<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Comparativo - {{ $paciente['nombre'] }} {{ $paciente['apellido'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            color: #1f2937;
            background: #ffffff;
            font-size: 12px;
        }

        .container {
            width: 100%;
            padding: 6px;
        }

        .header {
            margin-bottom: 8px;
            text-align: center;
        }

        .title {
            font-size: 20px;
            color: #1d4ed8;
            margin-bottom: 4px;
        }

        .subtitle {
            color: #6b7280;
            font-size: 12px;
        }

        .patient-meta {
            text-align: center;
            color: #4b5563;
            margin-bottom: 8px;
        }

        .split-layout {
            width: 100%;
            border: none;
            border-radius: 0;
            background: transparent;
            padding: 0;
            overflow: hidden;
            table-layout: fixed;
        }

        .split-layout td {
            vertical-align: top;
        }

        .column {
            width: 49%;
            padding: 0 10px;
        }

        .divider {
            width: 2%;
            border-left: 3px solid #d1d5db;
        }

        .column-title {
            font-size: 14px;
            font-weight: bold;
            color: #1d4ed8;
            margin-bottom: 8px;
        }

        .date-text {
            color: #6b7280;
            margin-bottom: 8px;
        }

        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .badge-leve {
            background-color: #dcfce7;
            color: #166534;
        }

        .badge-moderado {
            background-color: #fef3c7;
            color: #92400e;
        }

        .badge-severo {
            background-color: #fee2e2;
            color: #991b1b;
        }

        .badge-ausente {
            background-color: #f3f4f6;
            color: #374151;
        }

        .images-grid {
            width: 100%;
        }

        .images-grid td {
            width: 50%;
            padding: 4px;
        }

        .image-item {
            width: 100%;
            height: 260px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .image-single {
            height: 355px;
        }

        .image-double {
            height: 250px;
        }

        .image-triple {
            height: 180px;
        }

        .no-data {
            color: #9ca3af;
            font-style: italic;
            margin-top: 8px;
        }

        .footer {
            margin-top: 6px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Reporte Comparativo de Evaluaciones</h1>
            <p class="subtitle">Comparación de las 2 últimas evaluaciones</p>
        </div>

        <div class="patient-meta">
            {{ $paciente['nombre'] }} {{ $paciente['apellido'] }} | DNI: {{ $paciente['dni'] }}
        </div>

        <table class="split-layout">
            <tr>
                <td class="column">
                    <div class="column-title">Evaluación más reciente</div>
                    <div class="date-text">{{ $evaluacion_actual['fecha'] }} {{ $evaluacion_actual['hora'] }}</div>
                    @php
                    $resultado = strtolower($evaluacion_actual['resultado'] ?? '');
                    $badgeClass = 'badge ';
                    if (str_contains($resultado, 'leve')) {
                    $badgeClass .= 'badge-leve';
                    } elseif (str_contains($resultado, 'moderado')) {
                    $badgeClass .= 'badge-moderado';
                    } elseif (str_contains($resultado, 'severo')) {
                    $badgeClass .= 'badge-severo';
                    } else {
                    $badgeClass .= 'badge-ausente';
                    }
                    @endphp
                    <div>
                        <span class="{{ $badgeClass }}">{{ $evaluacion_actual['resultado'] }}</span>
                    </div>

                    @php
                    $actualCount = count($evaluacion_actual['imagenes'] ?? []);
                    $actualImageClass = 'image-item image-triple';
                    if ($actualCount === 1) {
                    $actualImageClass = 'image-item image-single';
                    } elseif ($actualCount === 2) {
                    $actualImageClass = 'image-item image-double';
                    }
                    @endphp

                    @if(!empty($evaluacion_actual['imagenes']))
                    <table class="images-grid">
                        <tr>
                            @foreach($evaluacion_actual['imagenes'] as $index => $imagen)
                            <td>
                                <img src="{{ $imagen['src'] }}" alt="Imagen evaluación actual" class="{{ $actualImageClass }}">
                            </td>
                            @if($index % 2 === 1)
                        </tr>
                        <tr>
                            @endif
                            @endforeach
                        </tr>
                    </table>
                    @else
                    <div class="no-data">Sin imágenes seleccionadas</div>
                    @endif
                </td>

                <td class="divider"></td>

                <td class="column">
                    <div class="column-title">Evaluación anterior</div>
                    <div class="date-text">{{ $evaluacion_anterior['fecha'] }} {{ $evaluacion_anterior['hora'] }}</div>
                    @php
                    $resultado = strtolower($evaluacion_anterior['resultado'] ?? '');
                    $badgeClass = 'badge ';
                    if (str_contains($resultado, 'leve')) {
                    $badgeClass .= 'badge-leve';
                    } elseif (str_contains($resultado, 'moderado')) {
                    $badgeClass .= 'badge-moderado';
                    } elseif (str_contains($resultado, 'severo')) {
                    $badgeClass .= 'badge-severo';
                    } else {
                    $badgeClass .= 'badge-ausente';
                    }
                    @endphp
                    <div>
                        <span class="{{ $badgeClass }}">{{ $evaluacion_anterior['resultado'] }}</span>
                    </div>

                    @php
                    $anteriorCount = count($evaluacion_anterior['imagenes'] ?? []);
                    $anteriorImageClass = 'image-item image-triple';
                    if ($anteriorCount === 1) {
                    $anteriorImageClass = 'image-item image-single';
                    } elseif ($anteriorCount === 2) {
                    $anteriorImageClass = 'image-item image-double';
                    }
                    @endphp

                    @if(!empty($evaluacion_anterior['imagenes']))
                    <table class="images-grid">
                        <tr>
                            @foreach($evaluacion_anterior['imagenes'] as $index => $imagen)
                            <td>
                                <img src="{{ $imagen['src'] }}" alt="Imagen evaluación anterior" class="{{ $anteriorImageClass }}">
                            </td>
                            @if($index % 2 === 1)
                        </tr>
                        <tr>
                            @endif
                            @endforeach
                        </tr>
                    </table>
                    @else
                    <div class="no-data">Sin imágenes seleccionadas</div>
                    @endif
                </td>
            </tr>
        </table>

        <div class="footer">
            <p>Dermedic - Sistema de Clasificación de Acné Vulgar</p>
            <p>Reporte generado el {{ now()->format('d/m/Y H:i:s') }}</p>
        </div>
    </div>
</body>

</html>
