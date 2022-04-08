import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit, ViewDidEnter {
  // @ViewChild(IonSlides) slides: IonSlides;

    @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  @Input('img')img: any;
  public images: any = ['assets/images/agent/propco-button.png1', 'assets/images/agent/propco-button.png', 'assets/images/agent/propco-button.png1', 'assets/images/agent/propco-button.png1', 'assets/images/agent/propco-button.png1'];

 
  sliderOpts = {
    loop: true,

    zoom: true
  };
 

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log("img", this.img);

    
  }

  ionViewDidEnter(){
    this.slides.slideTo(2);

    this.slides.update();
  }
 
  async zoom(zoomIn: boolean) {
    const slider = await this.slides.getSwiper();
    const zoom = slider.zoom;
    zoomIn ? zoom.in() : zoom.out();
  }
 
  close() {
    this.modalController.dismiss();
  }

}
