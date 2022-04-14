import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit, ViewDidEnter {
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  @Input() imgList: any;
  @Input() selectedIndex: number;
  @Input() baseUrl;

  sliderOpts = {
    loop: true,
    zoom: true
  };

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.slides.slideTo(this.selectedIndex + 1);
  }

  async zoom(zoomIn: boolean) {
    const slider = await this.slides.getSwiper();
    const zoom = slider.zoom;
    zoomIn ? zoom.in() : zoom.out();
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }
  
  close() {
    this.modalController.dismiss();
  }

}
