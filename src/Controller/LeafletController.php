<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class LeafletController extends AbstractController
{
    #[Route('/leaflet', name: 'app_leaflet_index')]
    public function index(): Response
    {
        return $this->render('leaflet/map.html.twig');
    }
}